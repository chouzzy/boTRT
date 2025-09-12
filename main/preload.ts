// app/preload.js
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
    dateSelected,
    importDataProps,
    ScrapeData,
    // Importe os novos tipos de payload que definimos acima
    LoadingPayload,
    ProcessFinishedPayload,
    ProgressPercentualPayload,
    ProcessosEncontradosPayload,
    InvalidExcelFormatPayload,
    ProgressMessagesDetailsPayload,
    CallFrontPayload, // Exemplo
    LoginErrorPayload,  // Exemplo
} from './types/generalTypes'; // Ajuste o caminho se necessário



// A função 'on' genérica pode permanecer, pois os métodos específicos fornecerão a tipagem
const baseOn = (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        callback(...args);
    // Considerar a lógica de remover listeners anteriores se o preload puder ser recarregado em dev
    // ipcRenderer.removeAllListeners(channel); // Pode ser arriscado se múltiplos componentes ouvirem o mesmo canal
    ipcRenderer.on(channel, subscription);

    return () => {
        ipcRenderer.removeListener(channel, subscription);
    };
};

const handler = {
    send(channel: string, value: unknown) {
        ipcRenderer.send(channel, value);
    },
    // Função genérica 'on' (você pode optar por não expô-la diretamente se preferir)
    // on: baseOn, // Se quiser expor a 'on' genérica

    // --- Métodos específicos para ENVIAR dados para o Main (Renderer -> Main) ---
    sendMessage: (message: string) => ipcRenderer.send('send-message', message),
    dateSelected: (date: dateSelected) => ipcRenderer.send('date-selected', date),
    scrapeData: (scrapeData: ScrapeData) => ipcRenderer.send('scrape-data', scrapeData),
    // Métodos que INVOCAM e esperam uma resposta (Renderer -> Main -> Renderer)
    saveFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:saveFile'), // Retorno do dialog.showSaveDialog
    // Exemplo para o saveExcel se você o refatorar para invoke:
    triggerSaveExcelDialog: (): Promise<{ success: boolean, message?: string, error?: string }> => ipcRenderer.invoke('dialog:save-excel'),

    // --- Métodos específicos para OUVIR dados do Main (Main -> Renderer) ---
    // Cada um agora usa o tipo de payload específico no callback
    callFront: (callback: (payload: CallFrontPayload) => void) => baseOn('call-front', (data) => callback(data as CallFrontPayload)),
    isLoading: (callback: (payload: any) => void) => baseOn('is-loading', (data) => callback(data)),
    loginError: (callback: (payload: LoginErrorPayload) => void) => baseOn('login-error', (data) => callback(data as LoginErrorPayload)),
    processFinished: (callback: (payload: ProcessFinishedPayload) => void) => baseOn('process-finished', (data) => callback(data as ProcessFinishedPayload)),
    progressPercentual: (callback: (payload: ProgressPercentualPayload) => void) => baseOn('progress-percentual', (data) => callback(data as ProgressPercentualPayload)),
    processosEncontrados: (callback: (payload: any) => void) => baseOn('processos-encontrados', (data) => callback(data)),
    invalidExcelFormat: (callback: (payload: InvalidExcelFormatPayload) => void) => baseOn('invalid-excel-format', (data) => callback(data as InvalidExcelFormatPayload)),
    progressMessagesDetails: (callback: (payload: ProgressMessagesDetailsPayload) => void) => baseOn('progress-messages', (data) => callback(data as ProgressMessagesDetailsPayload)),

    // --- AS NOVAS FUNÇÕES DA PONTE ---
    // 1. Pede ao processo main para INICIAR todo o fluxo de login.
    startLogin: (): void => ipcRenderer.send('auth:start-login'),

    // 2. Ouve o evento de SUCESSO vindo do processo main.
    onLoginSuccess: (callback: () => void) => baseOn('auth:login-success', callback),

    // A MUDANÇA: Novo método para ouvir o callback do Auth0
    onAuth0Callback: (callback: (url: string) => void) => baseOn('auth0-callback', (url) => callback(url as string)),

    // --- GERENCIAMENTO DE SESSÃO ---
    // Renderer -> Main: Pergunta se o usuário está autenticado (ao iniciar o app).
    isAuthenticated: (): Promise<boolean> => ipcRenderer.invoke('auth:is-authenticated'),

    // Renderer -> Main: Pede o token de acesso para fazer chamadas de API.
    getAccessToken: (): Promise<string | null> => ipcRenderer.invoke('auth:get-access-token'),

    // Renderer -> Main: Pede para fazer logout.
    logout: (): void => ipcRenderer.send('auth:logout'),

    openExternal: (url: string) => ipcRenderer.send('open-external-link', url),

    scrapeCeat: (cnpj: string) => ipcRenderer.send('scrape-ceat', { cnpj }),


    // No seu handler do preload.js
    processUploadedExcel: (data: { fileBuffer: Buffer, fileName: string, operationType: string }) =>
        ipcRenderer.send('process-excel-file', data),

    window: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
    },
};

try {
    contextBridge.exposeInMainWorld('ipc', handler);
    // Adicione este log logo após o exposeInMainWorld
    console.log('[Preload Script] - SUCESSO: contextBridge.exposeInMainWorld("ipc") executado.');
} catch (error) {
    // Adicione um catch para ver se o exposeInMainWorld está falhando
    console.error('[Preload Script] - ERRO ao executar contextBridge:', error);
}


// Este tipo agora reflete as assinaturas mais específicas dos callbacks
export type IpcHandler = typeof handler;
