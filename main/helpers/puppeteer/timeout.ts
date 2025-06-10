import { Page } from "puppeteer";

export async function navTimeout(page: Page, timeout?: number) {

    // TIMEOUT
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: timeout ?? 1500 });
    } catch (error) {

    }

}