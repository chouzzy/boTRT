import { excelDataIdentified } from "../../../types/audiencias";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected } from "../../../types/generalTypes";
import { consumeMinhaPautaApi } from "./consumeMinhaPautaApi";

async function scrapeMinhaPauta(
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
        apiResponse = await consumeMinhaPautaApi(painel, dateSelected, 'primeirograu', trt, credentials, startPuppeteer, mainWindow)

        if (apiResponse.excelData[0].numeroProcesso == "Erro de autenticação") {
            return listOfExcelData
        }

        listOfExcelData.push(apiResponse)

        apiResponse = await consumeMinhaPautaApi(painel, dateSelected, 'segundograu', trt, credentials, startPuppeteer, mainWindow)

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