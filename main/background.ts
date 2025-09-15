// main/background.ts

// ============================================================================
//   IMPORTS
// ============================================================================
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import Store from 'electron-store';
import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import dotenv from 'dotenv';

import { createWindow } from './helpers';
import { initializeIpcHandlers } from './ipcHandlers/ipcHandlers';

// ============================================================================
//   CONFIGURAÇÃO INICIAL
// ============================================================================

import config from '../config.json';

const isProd = process.env.NODE_ENV === 'production';
// Usamos um namespace para garantir que os dados de autenticação fiquem isolados
const store = new Store({ name: 'auth_session' });
// Carrega as variáveis de ambiente do arquivo renderer/.env para o processo main
const envPath = isProd
  ? path.resolve(__dirname, '..', 'renderer', '.env')
  : path.resolve(__dirname, '..', 'renderer', '.env'); // O caminho é o mesmo em dev
dotenv.config({ path: envPath });

// --- Funções Auxiliares de Criptografia (Padrão PKCE) ---
function base64URLEncode(str: Buffer): string {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest();
}

// --- Variáveis Globais de Janela ---
let mainWindow: BrowserWindow | null;
let authWindow: BrowserWindow | null; // Janela dedicada para o login

// --- Configuração do Protocolo Customizado e Instância Única ---
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

// ============================================================================
//   INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================
(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    minimizable: true,
    resizable: true,
    closable: true,
    height: 800,
    width: 1280,
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
//   FLUXO DE LOGIN CENTRALIZADO (com Janela Interna)
// ============================================================================

// Ouve o pedido do frontend para iniciar o login
ipcMain.on('auth:start-login', async () => {
  try {
    const codeVerifier = base64URLEncode(randomBytes(32));
    store.set('pkce_code_verifier', codeVerifier);
    const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier, 'ascii')));

    const { domain, clientId, audience } = config.auth0;

    const authUrl = `https://${domain}/authorize?` +
      `audience=${audience}&` +
      `scope=openid profile email offline_access&` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256&` +
      `redirect_uri=botrt://callback`;

    // Cria a nova janela de login dedicada
    authWindow = new BrowserWindow({
      width: 600,
      height: 800,
      modal: true,
      parent: mainWindow!,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    authWindow.loadURL(authUrl);

    // Ouve o redirecionamento DENTRO da janela de login
    const { webContents } = authWindow;
    webContents.on('will-redirect', (event, url) => {
      handleAuthCallback(url);
    });

    authWindow.on('closed', () => { authWindow = null; });

  } catch (error) {
    console.error("Erro ao iniciar login:", error);
  }
});

// Processa a URL de callback recebida da janela de login
const handleAuthCallback = async (url: string) => {
  if (url.startsWith('botrt://callback')) {
    const code = new URL(url).searchParams.get('code');
    if (code && mainWindow) {
      try {
        const codeVerifier = store.get('pkce_code_verifier');
        if (!codeVerifier) throw new Error("Code Verifier não encontrado.");
        store.delete('pkce_code_verifier');

        const { domain, clientId } = config.auth0;

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

// ============================================================================
//   HANDLERS IPC PARA GERENCIAMENTO DE SESSÃO
// ============================================================================

ipcMain.handle('auth:is-authenticated', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  return !!tokens?.access_token;
});

ipcMain.handle('auth:get-access-token', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  return tokens?.access_token || null;
});

// --- Ouve o pedido de logout (LÓGICA ATUALIZADA E CORRIGIDA) ---
ipcMain.on('auth:logout', () => {
  // 1. Limpa a sessão local no electron-store
  store.delete('tokens');
  console.log('[LOGOUT] Sessão local do BoTRT limpa.');

  // 2. Recarrega a janela principal IMEDIATAMENTE para dar feedback ao usuário
  mainWindow?.reload();
  console.log('[LOGOUT] Janela principal recarregada.');

  // 3. Constrói a URL de logout para limpar a sessão central (SSO)
  const { domain, clientId } = config.auth0;
  const returnTo = 'https://www.awer.co';

  const logoutUrl = `https://${domain}/v2/logout?` +
    `client_id=${clientId}&` +
    `returnTo=${encodeURIComponent(returnTo)}&` +
    `federated`;

  // 4. Cria uma janela invisível para processar o logout em segundo plano
  const logoutWindow = new BrowserWindow({ show: false });

  logoutWindow.loadURL(logoutUrl);

  // Ouve o redirecionamento para saber quando o logout foi concluído e fechar a janela
  logoutWindow.webContents.on('will-redirect', (event, url) => {
    if (url.startsWith(returnTo)) {
      console.log('[LOGOUT] Sessão do Auth0 e do provedor (Google) limpa com sucesso.');
      logoutWindow.close();
    }
  });
});



ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url);
});

// ============================================================================
//   HANDLERS DE EVENTOS DO APP
// ============================================================================
// Os handlers 'second-instance' e 'open-url' são mantidos como uma boa prática
// para o caso de o usuário tentar abrir o app novamente, mas não são mais
// a via principal para o callback do login.
app.on('second-instance', (event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
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
