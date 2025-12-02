import { apiResponseArquivadosProps, excelDataIdentified, ProcessosArquivadosSimplificado } from "../../../types/audiencias";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected, processosArquivadosExcelList } from "../../../types/generalTypes";
import { ConsumeProcessosArquivadosApi } from "./consumeProcessosArquivadosApi";
import { filtrarPorData } from "./dateFilter";

async function scrapeArquivados(
    chaveSecretaMFA: string,
    painel: ScrapeData["painel"],
    credentials: credentials,
    trt: number,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow,
    date?: processosArquivadosExcelList["date"],
): Promise<apiResponseArquivadosProps[]> {


    let apiResponse: apiResponseArquivadosProps | "loginError"

    const listOfExcelData: apiResponseArquivadosProps[] = []

    try {


        mainWindow.webContents.send('progress-messages', { message: `Iniciando busca nos processos arquivados para TRT-${trt}, primeiro grau...` });
        apiResponse = await ConsumeProcessosArquivadosApi(chaveSecretaMFA, painel, 'primeirograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        if (date) {
            const filterResponsePrimeiroGrau = await filtrarPorData(apiResponse, date.initial, date.final)
            listOfExcelData.push(filterResponsePrimeiroGrau)
        } else {
            listOfExcelData.push(apiResponse)

        }



        // apiResponse = await ConsumeProcessosArquivadosApi(painel, 'segundograu', trt, credentials, startPuppeteer, mainWindow)

        // if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
        //     return listOfExcelData
        // }

        // if (date) {
        //     const filterResponseSegundoGrau = await filtrarPorData(apiResponse, date.initial, date.final)
        //     listOfExcelData.push(filterResponseSegundoGrau)

        // } else {
        //     listOfExcelData.push(apiResponse)
        // }






        return listOfExcelData

    } catch (error) {

        throw error
    }

}


export { scrapeArquivados }