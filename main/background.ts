// app/background.js (ou .ts se você converter)
import path from 'path';
import { app, BrowserWindow, dialog } from 'electron'; // Removido ipcMain e dialog daqui por enquanto
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { initializeCrawlerService } from './services/CrawlerService';
import { initializeIpcHandlers } from './ipcHandlers/ipcHandlers';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' }); // Ajuste 'app' para 'renderer/out' se for a saída do build do Next.js
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', { // Assume que createWindow retorna a BrowserWindow
    // icon: './app/images/logos/boTRT-icon.ico', // Ajustei o caminho para assets/
    minimizable: true,
    resizable: true,
    closable: true,
    height: 700,
    width: 1320,
    center: true,
    frame: false, // Remove a moldura padrão da janela (incluindo a barra de título)
    titleBarStyle: 'hidden', // No macOS, isso esconde a barra de título mas mantém os botões de "semáforo"
    transparent: true, // Permite que a janela tenha áreas transparentes (bom para bordas arredondadas na UI)

    icon: path.join(__dirname, '../resources/icon.ico'), // Caminho para o ícone
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // __dirname aponta para a pasta 'app' aqui
      devTools: !isProd, // Abre DevTools apenas em desenvolvimento
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 3. Mostra a janela, já maximizada, para o usuário
  mainWindow.show();


  // Carrega a URL do frontend Next.js
  if (isProd) {

    await mainWindow.loadURL('app://./');
    console.log('__dirname do background.js:', __dirname);
    console.log('Caminho completo do preload:', path.join(__dirname, 'preload.js'));

  } else {

    console.log('__dirname do background.js:', __dirname);
    console.log('Caminho completo do preload:', path.join(__dirname, 'preload.js'));
    const port = process.argv[2]; // Nextron passa a porta como argumento
    await mainWindow.loadURL(`http://localhost:${port}/`);
    // mainWindow.webContents.openDevTools()

  }

  // Inicializa todos os seus listeners e handlers IPC
  // Passamos a mainWindow para que os handlers possam enviar mensagens de volta para ela
  await initializeIpcHandlers({ mainWindow });
  console.log("Handlers IPC inicializados.");

})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // Comportamento padrão macOS
    app.quit();
  }
});

app.on('activate', () => {
  // No macOS, é comum recriar uma janela no aplicativo quando o
  // ícone do dock é clicado e não há outras janelas abertas.
  if (BrowserWindow.getAllWindows().length === 0) {
    // Chame sua função para criar a janela principal novamente
    // const newMainWindow = createWindow('main', {...});
    // initializeIpcHandlers(newMainWindow); // E reinicialize os handlers para a nova janela
    // (Seu createWindow precisaria estar acessível aqui, ou recrie a lógica)
    // Por ora, vamos focar no fluxo principal.
  }
});

// Mantenha apenas handlers IPC MUITO genéricos ou de baixo nível aqui, se houver.
// O ideal é que todos os handlers específicos da aplicação fiquem em ipcHandlers.ts
// Exemplo:
// ipcMain.on('get-app-version', (event) => {
//   event.returnValue = app.getVersion();
// });
