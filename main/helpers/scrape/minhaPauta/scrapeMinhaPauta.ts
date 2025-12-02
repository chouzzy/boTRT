import { excelDataIdentified } from "../../../types/audiencias";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected } from "../../../types/generalTypes";
import { consumeMinhaPautaApi } from "./consumeMinhaPautaApi";

async function scrapeMinhaPauta(
    chaveSecretaMFA: string,
    painel: ScrapeData["painel"],
    dateSelected: dateSelected,
    credentials: credentials,
    trt: number,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow
): Promise<excelDataIdentified[]> {


    let apiResponse: excelDataIdentified | "loginError"

    const listOfExcelData: excelDataIdentified[] = []


    try {
        console.log('Inside scrapeMinhaPauta')
        mainWindow.webContents.send('progress-messages', { message: `Iniciando busca nos processos da minha pauta para TRT-${trt}, primeiro grau...` });
        apiResponse = await consumeMinhaPautaApi(chaveSecretaMFA, painel, dateSelected, 'primeirograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        listOfExcelData.push(apiResponse)

        mainWindow.webContents.send('progress-messages', { message: `Iniciando busca nos processos da minha pauta para TRT-${trt}, segundo grau...` });
        apiResponse = await consumeMinhaPautaApi(chaveSecretaMFA, painel, dateSelected, 'segundograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        listOfExcelData.push(apiResponse)

        return listOfExcelData

    } catch (error) {

        throw error
    }




}


export { scrapeMinhaPauta }