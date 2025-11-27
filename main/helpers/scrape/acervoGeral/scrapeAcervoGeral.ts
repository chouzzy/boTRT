
import { apiResponseAcervoGeralProps } from "../../../types/acervoGeral";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected, processosArquivadosExcelList } from "../../../types/generalTypes";
import { ConsumeAcervoGeralApi } from "./consumeAcervoGeralApi";
import { filtrarPorData } from "./dateFilter";

async function scrapeAcervoGeral(
    chaveSecretaMFA: string,
    painel: ScrapeData["painel"],
    credentials: credentials,
    trt: number,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow,
    date?: processosArquivadosExcelList["date"],
): Promise<apiResponseAcervoGeralProps[]> {


    let apiResponse: apiResponseAcervoGeralProps | "loginError"

    const listOfExcelData: apiResponseAcervoGeralProps[] = []

    try {

        mainWindow.webContents.send('progress-messages', { message: `Iniciando busca no acervo geral para TRT-${trt}, primeiro grau...` });
        apiResponse = await ConsumeAcervoGeralApi(chaveSecretaMFA, painel, 'primeirograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        if (date) {
            const filterResponsePrimeiroGrau = await filtrarPorData(apiResponse, date.initial, date.final)
            listOfExcelData.push(filterResponsePrimeiroGrau)
        } else {
            listOfExcelData.push(apiResponse)

        }



        mainWindow.webContents.send('progress-messages', { message: `Iniciando busca no acervo geral para TRT-${trt}, segundo grau...` });
        apiResponse = await ConsumeAcervoGeralApi(chaveSecretaMFA, painel, 'segundograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        if (date) {
            const filterResponsePrimeiroGrau = await filtrarPorData(apiResponse, date.initial, date.final)
            listOfExcelData.push(filterResponsePrimeiroGrau)
        } else {
            listOfExcelData.push(apiResponse)

        }






        return listOfExcelData

    } catch (error) {

        throw error
    }

}


export { scrapeAcervoGeral }