// main/background.ts

import path from 'path';
// A MUDANÇA: Importamos o 'shell' para abrir links externos
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { initializeIpcHandlers } from './ipcHandlers/ipcHandlers';
import { createHash, randomBytes } from 'crypto';
import Store from 'electron-store';
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const store = new Store();


// --- Funções Auxiliares de Criptografia (agora no backend) ---
function base64URLEncode(str: Buffer): string {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest();
}

let authWindow: BrowserWindow | null; // Janela dedicada para o login

// --- Configuração do Protocolo Customizado (Auth0) ---
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('botrt', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('botrt');
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// --- Servidor de Arquivos Estáticos para Produção ---
if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let mainWindow: BrowserWindow | null;

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    minimizable: true,
    resizable: true,
    closable: true,
    height: 980,
    width: 1920,
    center: true,
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    icon: path.join(__dirname, '../resources/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !isProd,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // ============================================================================
  //   A MÁGICA: Intercepta a Navegação para o Login
  // ============================================================================
  // Este listener observa todas as tentativas de navegação dentro do app.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Verifica se a URL de destino é a página de login do Auth0.
    const auth0Domain = "dev-pzivs8swerlhnydf.us.auth0.com";
    if (url.includes(auth0Domain)) {
      // 1. Previne que a página abra DENTRO do app Electron.
      event.preventDefault();
      // 2. Usa o 'shell' do Electron para abrir a URL no navegador PADRÃO do usuário.
      shell.openExternal(url);
    }
  });

  mainWindow.show();

  if (isProd) {
    await mainWindow.loadURL('app://./');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
  }

  await initializeIpcHandlers({ mainWindow });
  console.log("Handlers IPC inicializados.");

})();
// ============================================================================
//   NOVO FLUXO DE LOGIN E GERENCIAMENTO DE SESSÃO
// ============================================================================

// Ouve o pedido do frontend para iniciar o login
ipcMain.on('auth:start-login', async () => {
  try {
    // 1. Gera e salva o "bilhete de ida" (code_verifier)
    const codeVerifier = base64URLEncode(randomBytes(32));
    store.set('pkce_code_verifier', codeVerifier);

    // 2. Cria o "desafio" a partir do bilhete
    const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier, 'ascii')));

    // 3. Constrói a URL de login
    const domain = 'dev-pzivs8swerlhnydf.us.auth0.com';
    const clientId = "xWxVdNhe14NRbjACn1cCrbEZpDt12Gh8";
    const audience = "https://auth.awer.co";

    const authUrl = `https://${domain}/authorize?` +
      `audience=${audience}&` +
      `scope=openid profile email offline_access&` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256&` +
      `redirect_uri=botrt://callback`;

    // 4. Cria a nova janela de login
    authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      modal: true,
      parent: mainWindow!,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    authWindow.loadURL(authUrl);

    // 5. Ouve o redirecionamento DENTRO da janela de login
    const { webContents } = authWindow;
    webContents.on('will-redirect', (event, url) => {
      handleAuthCallback(url);
    });


  } catch (error) {
    console.error("Erro ao iniciar login:", error);
  }
});

// Ouve o callback do Auth0
const handleAuthCallback = async (url: string) => {
  if (url.startsWith('botrt://callback')) {
    const code = new URL(url).searchParams.get('code');
    if (code && mainWindow) {
      try {
        const codeVerifier = store.get('pkce_code_verifier');
        store.delete('pkce_code_verifier');

        const domain = 'dev-pzivs8swerlhnydf.us.auth0.com';
        const clientId = "xWxVdNhe14NRbjACn1cCrbEZpDt12Gh8";

        const response = await axios.post(`https://${domain}/oauth/token`, new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code_verifier: codeVerifier as string,
          code,
          redirect_uri: 'botrt://callback',
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        store.set('tokens', response.data);
        mainWindow.reload();

      } catch (error: any) {
        console.error("Erro na troca de token:", error.response?.data || error.message);
      } finally {
        authWindow?.close();
      }
    }
  }
};

// Ouve o pedido do frontend para saber se está autenticado
ipcMain.handle('auth:is-authenticated', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  return !!tokens?.access_token;
});

// Ouve o pedido do frontend pelo token de acesso
ipcMain.handle('auth:get-access-token', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  // TODO: Adicionar lógica de refresh token aqui no futuro
  return tokens?.access_token || null;
});

// Ouve o pedido de logout
ipcMain.on('auth:logout', () => {
  store.delete('tokens'); // Limpa a sessão
  // TODO: Adicionar lógica para invalidar o token no Auth0
  mainWindow?.reload(); // Recarrega para voltar à tela de login
});







// NOVO LISTENER: Ouve o pedido do frontend para abrir um link externo.
ipcMain.on('open-external-link', (event, url) => {
  // Usa o 'shell' do Electron para abrir a URL de forma segura no navegador padrão.
  shell.openExternal(url);
});



app.on('second-instance', (event, commandLine) => {
  console.log("Segunda instância detectada. Comando:", commandLine);
  if (mainWindow) {
    console.log("Restaurando a janela principal.");
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    console.log("Janela principal restaurada e focada.");
    const url = commandLine.pop()?.slice(0, -1);
    console.log("URL recebida na segunda instância:", url);
    if (url) handleAuthCallback(url); // Chama nosso handler
    console.log("Callback do Auth0 processado na segunda instância.", url);
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    handleAuthCallback(url); // Chama nosso handler
    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Recrie a janela aqui se necessário
  }
});
