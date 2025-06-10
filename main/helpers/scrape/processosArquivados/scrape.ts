import { unescape } from "he";
import { AudienciaSimplificada, excelDataIdentified } from "../../../types/audiencias";
import { PuppeteerCallback, ScrapeData, credentials, dateSelected } from "../../../types/generalTypes";
import { navTimeout } from "../../puppeteer/timeout";
import { scrapeURL } from "../scrapeURL";

async function scrapeTRT(painel: ScrapeData["painel"], dateSelected: dateSelected, credentials: credentials, grau: string, trt: string, startPuppeteer: PuppeteerCallback) {

    try {


        const listOfExcelData: excelDataIdentified[] = []

        const { page, browser } = await startPuppeteer(false)

        await page.goto(`https://pje.trt${trt}.jus.br/${grau}/login.seam`);
        // await page.waitForNavigation({timeout:2000})

        try {

            await page.waitForSelector('#btnEntrar')
        } catch (error) {
            console.log('erro-entrar')
        }

        // LOGIN TRT
        const { user, password } = credentials

        await page.type('#username', user);
        await page.type('#password', password);


        await page.click('#btnEntrar')

    } catch (error) {
        throw error
    }


}



export { scrapeTRT }