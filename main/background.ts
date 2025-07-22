// main/background.ts

import path from 'path';
// A MUDANÇA: Importamos o 'shell' para abrir links externos
import { app, BrowserWindow, shell } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { initializeIpcHandlers } from './ipcHandlers/ipcHandlers';

const isProd = process.env.NODE_ENV === 'production';

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
    const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'dev-pzivs8swerlhnydf.us.auth0.com';
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

// --- Handlers de Eventos do App (sem alterações) ---
app.on('second-instance', (event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    const url = commandLine.pop()?.slice(0, -1);
    if (url) {
      mainWindow.webContents.send('auth0-callback', url);
    }
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('auth0-callback', url);
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
