import { Browser, executablePath, Page } from "puppeteer";
import { PuppeteerResult } from "../../types/generalTypes";
import { timeoutDelay } from "../converters/timeOutDelay";
const PCR = require("puppeteer-chromium-resolver");
import puppeteer from 'puppeteer';


export async function searchInput(page: Page, inputText: string) {
   const inputSearch = 'input#txtBusca';
   await page.waitForSelector(inputSearch);
   await page.type(inputSearch, inputText);
   await timeoutDelay(2);
}

export async function closeBrowser(browser:Browser) {
   try {
      await browser.close();
   } catch (error) {
   }
}

export async function startPuppeteer(headless: boolean): Promise<PuppeteerResult> {

   try {

      const options = {};
      const stats = await PCR(options);

      const browser = await stats.puppeteer.launch({
         headless: false,
         args: [
            // "--no-sandbox",
            `--window-size=${920},${920}`,
         ],
         // executablePath: stats.executablePath
         executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" 
      }).catch(function (error:unknown) {
         throw `${stats.executablePath} ------- ${error}`
      });

      // const browser = await puppeteer.launch()

      const page = await browser.newPage();
      await page.setViewport({
         width: 720,
         height: 920,
      });

      console.log('tudo ok com o pupa')
      await page.setBypassCSP(true)

      return { page, browser }

   } catch (error) {
      throw error
   }
}