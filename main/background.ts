// ============================================================================
//   IMPORTS
// ============================================================================
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import serve from 'electron-serve';
import Store from 'electron-store';
import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { jwtDecode } from 'jwt-decode';

import { createWindow } from './helpers';
import { initializeIpcHandlers } from './ipcHandlers/ipcHandlers';

// ============================================================================
//   CONFIGURAÇÃO INICIAL
// ============================================================================

import config from '../config.json';

const isProd = process.env.NODE_ENV === 'production';
const store = new Store({ name: 'auth_session' });
const envPath = isProd
  ? path.resolve(__dirname, '..', 'renderer', '.env')
  : path.resolve(__dirname, '..', 'renderer', '.env');
dotenv.config({ path: envPath });

function base64URLEncode(str: Buffer): string {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest();
}

let mainWindow: BrowserWindow | null;
let authWindow: BrowserWindow | null;

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

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    minimizable: true,
    resizable: true,
    closable: true,
    height: 800,
    width: 1480,
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

    authWindow = new BrowserWindow({
      width: 600,
      height: 800,
      modal: true,
      parent: mainWindow!,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    authWindow.loadURL(authUrl);

    const { webContents } = authWindow;
    webContents.on('will-redirect', (event, url) => {
      handleAuthCallback(url);
    });

    authWindow.on('closed', () => { authWindow = null; });

  } catch (error) {
    console.error("Erro ao iniciar login:", error);
  }
});

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

        // ==========================================================
        // ✨ LÓGICA CORRIGIDA AQUI ✨
        // Decodifica o id_token (e não o access_token) para salvar o perfil.
        // ==========================================================
        if (response.data.id_token) {
            try {
                const userProfile: { name: string, picture: string, email: string } = jwtDecode(response.data.id_token);
                store.set('user_profile', {
                    name: userProfile.name,
                    picture: userProfile.picture,
                    email: userProfile.email,
                });
                console.log('[AUTH] Perfil do usuário salvo com sucesso.');
            } catch (error) {
                console.error("Erro ao decodificar o id_token:", error);
            }
        }

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
//   HANDLERS IPC PARA GERENCIAMENTO DE SESSÃO
// ============================================================================

ipcMain.handle('auth:is-authenticated', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  return !!tokens?.access_token;
});

ipcMain.handle('auth:get-access-token', async () => {
  const tokens = store.get('tokens') as { access_token?: string } | undefined;
  return tokens?.access_token || null;
});

// ✨ HANDLER SIMPLIFICADO E CORRIGIDO ✨
// Agora ele apenas lê o perfil que já foi salvo no store.
ipcMain.handle('auth:get-user-profile', async () => {
    const userProfile = store.get('user_profile');
    return userProfile || null;
});


ipcMain.on('auth:logout', () => {
  store.delete('tokens');
  // ✨ LIMPEZA DO PERFIL NO LOGOUT ✨
  store.delete('user_profile');
  console.log('[LOGOUT] Sessão local do BoTRT limpa.');

  mainWindow?.reload();
  console.log('[LOGOUT] Janela principal recarregada.');

  const { domain, clientId } = config.auth0;
  const returnTo = 'https://www.awer.co';

  const logoutUrl = `https://${domain}/v2/logout?` +
    `client_id=${clientId}&` +
    `returnTo=${encodeURIComponent(returnTo)}&` +
    `federated`;

  const logoutWindow = new BrowserWindow({ show: false });
  logoutWindow.loadURL(logoutUrl);
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
//   HANDLERS DE EVENTOS DO APP
// ============================================================================
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

