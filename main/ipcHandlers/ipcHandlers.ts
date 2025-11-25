// app/ipcHandlers.ts
import { app, BrowserWindow, ipcMain } from "electron";
// Importe as funções de SERVIÇO
import { MainBostExcelService, MainBostService, handleSaveExcel } from '../services/CrawlerService';
import { importDataProps, ScrapeData } from "../types/generalTypes"; // Seus tipos
import { saveErrorLog } from "../helpers/logUtils";
import { CeatCrawlerService } from "../services/CeatCrawlerService";
import { TestMFAService } from "../services/TestMFAService";
import { MfaSetupService } from "../services/MFASetupService";


// ✨ 1. VARIÁVEL PARA GUARDAR A FUNÇÃO "RESOLVE" DA NOSSA PROMISE ✨
// Isso é o que permite ao backend pausar e esperar pelo frontend.
let mfaCodeResolver: ((code: string) => void) | null = null;
// ✨ 2. FUNÇÃO QUE O CRAWLER VAI CHAMAR (EXPORTADA) ✨
export function requestMfaCode(mainWindow: BrowserWindow): Promise<string> {

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('mfa:request-code');
    }

    return new Promise((resolve, reject) => {
        // 1. Guarda a função 'resolve' atual
        const currentResolver = resolve;

        // 2. Coloca ela na variável global
        mfaCodeResolver = currentResolver;

        // 3. Cria o timer de segurança
        setTimeout(() => {
            // ✨ A CORREÇÃO ESTÁ AQUI ✨
            // Só rejeita o timeout se o 'resolver' global ainda for O MEU resolver.
            // Se for 'null' (porque já foi resolvido) ou se for 'resolver_do_TRT17'
            // (porque o robô avançou), este timer não faz nada.
            if (mfaCodeResolver === currentResolver) {
                mfaCodeResolver = null;
                reject(new Error("Tempo limite para inserir o código MFA esgotado (5 minutos)."));
            }
        }, 300000); // 5 minutos
    });
}
interface InitializeHandlersProps {
    mainWindow: BrowserWindow;
}

export async function initializeIpcHandlers({ mainWindow }: InitializeHandlersProps) {

    // ============================================================================
    //   HANDLERS IPC PARA SETUP DE MFA AUTOMÁTICO
    // ============================================================================
    ipcMain.handle('setup-mfa-auto', async (event, credentials) => {
        return await MfaSetupService(mainWindow, credentials);
    });

    // ============================================================================
    //   HANDLERS IPC PARA TESTE DE MFA E OUTROS SERVIÇOS
    // ============================================================================ 
    ipcMain.handle('test-mfa-login', async (event, credentials) => {
        console.log("[IPC] Iniciando teste de MFA...");
        // Passa as credenciais para o serviço de teste
        return await TestMFAService(mainWindow, {
            user: credentials.user,
            pass: credentials.password,
            secretKey: credentials.secretKey
        });
    });

    ipcMain.on('process-excel-file', async (event, payload: importDataProps) => {

        console.log("IPC Handler: Recebido 'process-excel-file'", payload);
        const { fileBuffer, operationType } = payload;
        try {
            await MainBostExcelService(mainWindow, fileBuffer, operationType);
        } catch (error: any) {
            console.error("Handler 'process-excel-file' encontrou um erro vindo do serviço:", error.message);
        }
    });

    ipcMain.on('scrape-data', async (event, scrapeData: ScrapeData) => {
        console.log("IPC Handler: Recebido 'scrape-data'", scrapeData);
        try {
            await MainBostService(mainWindow, scrapeData);
        } catch (error: any) {
            console.error("Handler 'scrape-data' encontrou um erro vindo do serviço:", error.message);
        }
    });

    // NOVO: Handler para salvar o Excel (usa ipcMain.handle)
    ipcMain.handle('dialog:save-excel', async (event) => {
        console.log("IPC Handler: Recebido 'dialog:save-excel'");
        try {
            const result = await handleSaveExcel(mainWindow);
            return result; // Retorna { success: boolean, message?: string, error?: string }
        } catch (error: any) {
            console.error("Erro no handler 'dialog:save-excel':", error);
            saveErrorLog(error, "Erro ao tentar salvar o Excel via dialog:save-excel");
            return { success: false, error: error.message || "Erro desconhecido ao salvar." };
        }
    });

    // HANDLER DO CEAT ATUALIZADO
    // A assinatura foi ajustada para receber apenas o CNPJ como string
    ipcMain.handle('scrape-ceat', async (event, cnpj: string) => {
        console.log(`IPC Handler: Recebido 'scrape-ceat' para o CNPJ: ${cnpj}`);
        try {
            // Chama o serviço e aguarda os resultados
            const results = await CeatCrawlerService(mainWindow, { cnpj });

            // Envia o resultado de sucesso de volta para o frontend
            // Usando 'handle' o retorno já é a resposta para o 'invoke' do frontend
            return {
                success: true,
                message: `${results.length} processo(s) extraído(s) com sucesso!`,
                data: results
            };

        } catch (error: any) {
            console.error("Handler 'scrape-ceat' encontrou um erro vindo do serviço:", error.message);
            // Retorna o erro para o frontend
            return {
                success: false,
                error: `Falha na extração do CEAT: ${error.message}`
            };
        }
    });


    ipcMain.on('mfa:submit-code', (event, code: string) => {
        console.log(`[IPC] Código MFA recebido do frontend: ${code}`);

        if (mfaCodeResolver) {
            mfaCodeResolver(code); // "Acorda" o robô (seja qual for o TRT)
            mfaCodeResolver = null; // Limpa para a próxima
        } else {
            console.error("[IPC] ERRO: Recebeu código MFA, mas o 'mfaCodeResolver' estava nulo. O robô não estava esperando ou um timeout antigo o limpou.");
        }
    });


    ipcMain.on('window-close', (event) => {
        console.log("IPC Handler: Recebido 'window-close'");
        app.quit()
    })
    ipcMain.on('window-minimize', (event) => {
        console.log("IPC Handler: Recebido 'window-minimize'");
        mainWindow.minimize()
    })

    console.log("Todos os handlers IPC foram inicializados.");
}
