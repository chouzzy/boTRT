// app/ipcHandlers.ts
import { app, BrowserWindow, ipcMain } from "electron";
// Importe as funções de SERVIÇO
import { MainBostExcelService, MainBostService, handleSaveExcel } from '../services/CrawlerService';
import { importDataProps, ScrapeData } from "../types/generalTypes"; // Seus tipos
import { saveErrorLog } from "../helpers/logUtils";
// import { CeatCrawlerService } from "../services/CeatCrawlerService";

interface InitializeHandlersProps {
    mainWindow: BrowserWindow;
}

export async function initializeIpcHandlers({ mainWindow }: InitializeHandlersProps) {

    ipcMain.on('process-excel-file', async (event, payload: importDataProps) => {

        console.log("IPC Handler: Recebido 'process-excel-file'", payload);
        const { fileBuffer, operationType } = payload;
        try {
            await MainBostExcelService(mainWindow, fileBuffer, operationType);
        } catch (error: any) {
            // Erros já devem ser tratados e logados dentro de MainBostExcelService
            // E 'is-loading' e 'process-finished' também.
            // Aqui, podemos apenas logar que o handler recebeu um erro do serviço.
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

    // // HANDLER DO CEAT ATUALIZADO
    // // A assinatura foi ajustada para receber apenas o CNPJ como string
    // ipcMain.handle('scrape-ceat', async (event, cnpj: string) => {
    //     console.log(`IPC Handler: Recebido 'scrape-ceat' para o CNPJ: ${cnpj}`);
    //     try {
    //         // Chama o serviço e aguarda os resultados
    //         const results = await CeatCrawlerService(mainWindow, { cnpj });

    //         // Envia o resultado de sucesso de volta para o frontend
    //         // Usando 'handle' o retorno já é a resposta para o 'invoke' do frontend
    //         return {
    //             success: true,
    //             message: `${results.length} processo(s) extraído(s) com sucesso!`,
    //             data: results
    //         };

    //     } catch (error: any) {
    //         console.error("Handler 'scrape-ceat' encontrou um erro vindo do serviço:", error.message);
    //         // Retorna o erro para o frontend
    //         return {
    //             success: false,
    //             error: `Falha na extração do CEAT: ${error.message}`
    //         };
    //     }
    // });

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
