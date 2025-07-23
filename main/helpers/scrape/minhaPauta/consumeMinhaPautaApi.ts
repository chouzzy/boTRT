import { unescape } from "he";
import { AudienciaSimplificada, excelDataIdentified } from "../../../types/audiencias";
import { credentials, dateSelected, PuppeteerCallback, ScrapeData } from "../../../types/generalTypes";
import { scrapeURL } from "../scrapeURL";
import { ApiMinhaPautaResponse } from "./apiMinhaPautaTypes";
import { timeoutDelay } from "../../converters/timeOutDelay";


export async function consumeMinhaPautaApi(
    painel: ScrapeData["painel"],
    dateSelected: dateSelected,
    grau: string,
    trt: number,
    credentials: credentials,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow
) {

    try {


        const { page, browser } = await startPuppeteer(false)

        // Try para navegação e para identificação do tipo de Login e Ação de login
        try {
            // Teste de acesso ao TRT (aqui eliminamos a hipotese de um TRT inexistente)
            try {

                await page.goto(`https://pje.trt${trt}.jus.br/${grau}/login.seam`);
                // await page.waitForNavigation({timeout:60000})
            } catch (error) {
                throw error
            } finally {
                console.log('finally-mp')
            }

            let seletorDeLoginEncontrado = false; // Flag para controlar qual caminho seguir
            const { user, password } = credentials

            // Testa o tipo do login (aqui identificamos o tipo de login, se é PDPJ ou Padrão)
            try {
                const seletorDeLogin = await page.waitForSelector('::-p-xpath(//*[@id="username"])', { timeout: 10000, visible: true })

                if (seletorDeLogin) {
                    seletorDeLoginEncontrado = true;

                    await page.type('#username', user);
                    await page.type('#password', password);
                    await page.click('#btnEntrar')
                }


            } catch (error) {
                seletorDeLoginEncontrado = false;

                if (!seletorDeLoginEncontrado) {
                    await page.waitForSelector('::-p-xpath(//*[@id="btnSsoPdpj"])', { timeout: 30000, visible: true })
                    await page.click('::-p-xpath(//*[@id="btnSsoPdpj"])')
                    
                    await page.waitForSelector('::-p-xpath(//*[@id="username"])', { timeout: 30000, visible: true })
                    
                    await page.type('::-p-xpath(//*[@id="username"])', user);
                    await page.type('::-p-xpath(//*[@id="password"])', password);
                    
                    await page.click('::-p-xpath(//*[@id="kc-login"])');
                }
            }


            mainWindow.webContents.send(
                'progress-messages',
                `Buscando dados no TRT-${trt}...`
            );

            // CATCH PARA ERRO DE AUTENTICAÇÃO
        } catch (error) {

            console.log('erro de autenticação')

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            const loginErrorJson: excelDataIdentified = {
                excelData: [{
                    type: 'Minha pauta',
                    usuario: credentials.user,
                    numeroProcesso: 'Erro de autenticação',
                    orgaoJulgador: 'Erro de autenticação',
                    tipoAudiencia: 'Erro de autenticação',
                    dataInicio: 'Erro de autenticação',
                    dataFim: 'Erro de autenticação',
                    poloAtivo: 'Erro de autenticação',
                    poloPassivo: 'Erro de autenticação',
                }],
                identifier
            }

            mainWindow.webContents.send(
                'progress-messages',
                `Ocorreu um erro de autenticação no TRT-${trt}, seguindo para o próximo da lista...`
            );

            await browser.close()

            return loginErrorJson

        }

        // Try para teste de autenticação (caso login e senha estejam incorretos, o brasão não aparece)
        try {
            await page.waitForSelector('#brasao-republica', { visible: true })
        } catch (error) {

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            const loginErrorJson: excelDataIdentified = {
                excelData: [{
                    type: 'Minha pauta',
                    usuario: credentials.user,
                    numeroProcesso: 'Erro de autenticação',
                    orgaoJulgador: 'Erro de autenticação',
                    tipoAudiencia: 'Erro de autenticação',
                    dataInicio: 'Erro de autenticação',
                    dataFim: 'Erro de autenticação',
                    poloAtivo: 'Erro de autenticação',
                    poloPassivo: 'Erro de autenticação',
                }],
                identifier
            }

            mainWindow.webContents.send(
                'progress-messages',
                `Ocorreu um erro de autenticação no TRT-${trt}, seguindo para o próximo da lista...`
            );


            await browser.close()

            return loginErrorJson
        }

        // Código de navegação e scrape
        try {

            const url = await scrapeURL(painel, trt, 99999, grau, dateSelected)


            await page.goto(url);

            try {
                await page.waitForSelector('pre');

            } catch (error) {
                throw error
            }

            const html = await page.$eval('pre', el => el.textContent);

            const json: ApiMinhaPautaResponse = JSON.parse(html);

            await new Promise(resolve => setTimeout(resolve, 3000));

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            // ERRO DE LOGIN
            if (json.codigoErro == "ARQ-516") {

                const loginErrorJson: excelDataIdentified = {
                    excelData: [{
                        type: 'Minha pauta',
                        usuario: credentials.user,
                        numeroProcesso: 'erro',
                        orgaoJulgador: 'erro',
                        tipoAudiencia: 'erro',
                        dataInicio: 'erro',
                        dataFim: 'erro',
                        poloAtivo: 'erro',
                        poloPassivo: 'erro',
                    }],
                    identifier
                }

                await browser.close()

                return loginErrorJson
            }

            // EMPTY JSON
            if (json.totalRegistros == 0) {

                const emptyJson: excelDataIdentified = {
                    excelData: [{
                        type: 'Minha pauta',
                        usuario: credentials.user,
                        numeroProcesso: '',
                        orgaoJulgador: '',
                        tipoAudiencia: '',
                        dataInicio: '',
                        dataFim: '',
                        poloAtivo: '',
                        poloPassivo: '',
                    }],
                    identifier
                }

                await browser.close()

                return emptyJson
            }

            const excelData: AudienciaSimplificada[] = []; // Inicializando um array vazio

            // MODELANDO JSON
            json.resultado.forEach((audit) => {

                excelData.push({
                    type: 'Minha pauta',
                    usuario: credentials.user,
                    numeroProcesso: audit.processo.numero,
                    tipoAudiencia: unescape(audit.tipo.descricao),
                    orgaoJulgador: unescape(audit.processo.orgaoJulgador.descricao),
                    dataInicio: audit.dataInicio,
                    dataFim: audit.dataFim,
                    poloAtivo: audit.poloAtivo.nome,
                    poloPassivo: audit.poloPassivo.nome,
                    urlAudienciaVirtual: audit.urlAudienciaVirtual
                });
            });

            await browser.close()

            const excelDataIdentified: excelDataIdentified = {
                excelData,
                identifier
            }

            return excelDataIdentified

        } catch {

            await browser.close()

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            const emptyJson: excelDataIdentified = {
                excelData: [{
                    type: 'Minha pauta',
                    usuario: credentials.user,
                    numeroProcesso: 'erro',
                    orgaoJulgador: 'erro',
                    tipoAudiencia: 'erro',
                    dataInicio: 'erro',
                    dataFim: 'erro',
                    poloAtivo: 'erro',
                    poloPassivo: 'erro',
                }],
                identifier
            }
            return emptyJson
        }

    } catch (error) {
        throw error
    }

}