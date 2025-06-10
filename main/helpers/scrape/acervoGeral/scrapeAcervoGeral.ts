
import { apiResponseAcervoGeralProps } from "../../../types/acervoGeral";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected, processosArquivadosExcelList } from "../../../types/generalTypes";
import { ConsumeAcervoGeralApi } from "./consumeAcervoGeralApi";
import { filtrarPorData } from "./dateFilter";

async function scrapeAcervoGeral(
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


        apiResponse = await ConsumeAcervoGeralApi(painel, 'primeirograu', trt, credentials, startPuppeteer, mainWindow)

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
        apiResponse = await ConsumeAcervoGeralApi(painel, 'segundograu', trt, credentials, startPuppeteer, mainWindow)

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