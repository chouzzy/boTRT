import { credentials, PuppeteerCallback, ScrapeData } from "../../../types/generalTypes";
import { scrapeURL } from "../scrapeURL";
import { unescape } from "he";
import { navTimeout } from "../../puppeteer/timeout";
import { AcervoGeralSimplificado, apiResponseAcervoGeralProps } from "../../../types/acervoGeral";
import { requestMfaCode } from "../../../ipcHandlers/ipcHandlers";
import { totp } from "otplib";
import { excelDataIdentified } from "../../../types/audiencias";


export async function ConsumeAcervoGeralApi(
    chaveSecretaMFA: string,
    painel: ScrapeData["painel"],
    grau: string,
    trt: number,
    credentials: credentials,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow
): Promise<apiResponseAcervoGeralProps> {

    try {

        const { page, browser } = await startPuppeteer(false)
        let urlInterceptedID = ''


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

                    // 1. Acessando PDPJ
                    await page.waitForSelector('::-p-xpath(//*[@id="btnSsoPdpj"])', { timeout: 15000, visible: true });
                    await page.click('::-p-xpath(//*[@id="btnSsoPdpj"])');
                    console.log('[Login] Clicou em "Entrar com PJe"');

                    // 2. Fazendo login no PDPJ
                    await page.waitForSelector('::-p-xpath(//*[@id="username"])', { timeout: 15000, visible: true });
                    await page.type('::-p-xpath(//*[@id="username"])', user);
                    await page.type('::-p-xpath(//*[@id="password"])', password);
                    console.log('[Login] Preencheu usuário e senha.');

                    // 3. Clicando no botão de login (Corrigido, sem setTimeout)
                    // Clicamos e esperamos a página recarregar (ou o próximo seletor aparecer)
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
                        page.click('::-p-xpath(//*[@id="kc-login"])')
                    ]);
                    console.log('[Login] Clicou no botão de login. Página de MFA deve carregar.');

                    // 4. Loop de validação do MFA
                    let mfaCodeValid = false;
                    while (!mfaCodeValid) {

                        // 5. Espera o campo OTP aparecer
                        await page.waitForSelector('::-p-xpath(//*[@id="otp"])', { timeout: 15000, visible: true });

                        // 6. ✨ A MÁGICA: Pede o código ao usuário e PAUSA ✨
                        console.log('[Login] Solicitando código MFA ao usuário...');
                        mainWindow.webContents.send('progress-messages', { message: `🚨🚨🚨 Por favor, insira o código MFA de 6 dígitos... para acessar o TRT-${trt}` });

                        // O robô "dorme" aqui e só "acorda" quando o usuário digita o código no modal
                        const freshMfaCode = await requestMfaCode(mainWindow);

                        mainWindow.webContents.send('progress-messages', { message: `👍🏼👍🏼👍🏼 Código recebido. Tentando login... no TRT-${trt}` });
                        console.log(`[Login] Código recebido: ${freshMfaCode}`);

                        // 7. Digita o código novo
                        await page.type('::-p-xpath(//*[@id="otp"])', freshMfaCode);

                        // 8. Clica para logar e espera a resposta
                        console.log('[Login] Clicando no login após inserir o MFA...');
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
                            page.click('::-p-xpath(//*[@id="kc-login"])')
                        ]);

                        try {
                            await page.waitForSelector('#brasao-republica', { visible: true, timeout: 3000 });
                        } catch (error) {
                            console.log('[Login] Falha no login com o código MFA fornecido. Tentando novamente...');
                            mainWindow.webContents.send('progress-messages', { message: `🛑🛑🛑 Código MFA inválido. Por favor, tente novamente.` });

                            continue; // Volta para o início do loop para pedir o código novamente
                        }
                        console.log('[Login] Clique realizado. Verificando sucesso do login...');
                        mfaCodeValid = true; // <-- QUEBRA O LOOP

                    }
                    // O robô agora está logado e pode continuar o scrape...
                }
            }



            // CATCH PARA ERRO DE AUTENTICAÇÃO
        } catch (error) {

            console.log('erro de autenticação')

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            const loginErrorJson: apiResponseAcervoGeralProps = {
                excelData: [{
                    type: 'Acervo geral',
                    usuario: credentials.user,
                    numeroProcesso: 'Erro de autenticação',
                    descricaoOrgaoJulgador: 'Erro de autenticação',
                    nomeParteAutora: 'Erro de autenticação',
                    nomeParteRe: 'Erro de autenticação',
                    dataAutuacao: 'Erro de autenticação',
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

        try {
            await page.waitForSelector('#brasao-republica', { visible: true })

        } catch (error) {

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }


            const loginErrorJson: apiResponseAcervoGeralProps = {
                excelData: [{
                    type: 'Acervo geral',
                    usuario: credentials.user,
                    numeroProcesso: 'Erro de autenticação',
                    descricaoOrgaoJulgador: 'Erro de autenticação',
                    nomeParteAutora: 'Erro de autenticação',
                    nomeParteRe: 'Erro de autenticação',
                    dataAutuacao: 'Erro de autenticação',
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

        try {
            await navTimeout(page)

            await page.setRequestInterception(true);

            (async () => {

                page.on('request', interceptedRequest => {

                    if (interceptedRequest.url().includes(`https://pje.trt${trt}.jus.br/pje-comum-api/api/paineladvogado/`)) {

                        const regex = /\/paineladvogado\/(\d+)/;
                        const interceptedUrl = interceptedRequest.url()
                        const match = interceptedUrl.match(regex);
                        urlInterceptedID = match[1]

                        interceptedRequest.continue()
                        return urlInterceptedID
                    }
                    else {
                        interceptedRequest.continue()

                    }
                });
            })();

            await page.goto(`https://pje.trt${trt}.jus.br/pjekz/painel/usuario-externo/acervo-geral`)

            await page.waitForSelector("#mat-select-value-1 > span", { visible: true })

            const url = await scrapeURL(painel, trt, 1000, grau, undefined, urlInterceptedID)
            await page.goto(url);

            try {
                await page.waitForSelector('pre');

            } catch (error) {
                throw error
            }

            const html = await page.$eval('pre', el => el.textContent);

            const json: ApiAcervoGeralResponse = JSON.parse(html);

            await new Promise(resolve => setTimeout(resolve, 3000));

            const identifier: excelDataIdentified["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            if (json.codigoErro == "ARQ-516") {

                const emptyJson: apiResponseAcervoGeralProps = {
                    excelData: [{
                        type: 'Acervo geral',
                        usuario: credentials.user,
                        numeroProcesso: 'erro',
                        descricaoOrgaoJulgador: 'erro',
                        nomeParteAutora: 'erro',
                        nomeParteRe: 'erro',
                        dataAutuacao: 'erro',
                    }],
                    identifier
                }

                await browser.close()

                return emptyJson
            }

            if (json.totalRegistros == 0) {

                const emptyJson: apiResponseAcervoGeralProps = {
                    excelData: [{
                        type: 'Acervo geral',
                        usuario: credentials.user,
                        numeroProcesso: '',
                        descricaoOrgaoJulgador: '',
                        nomeParteAutora: '',
                        nomeParteRe: '',
                        dataAutuacao: '',
                    }],
                    identifier
                }

                await browser.close()

                return emptyJson
            }

            const excelData: AcervoGeralSimplificado[] = []; // Inicializando um array vazio


            json.resultado.forEach(audit => {
                excelData.push({
                    type: 'Acervo geral',
                    usuario: credentials.user,
                    numeroProcesso: unescape(audit.numeroProcesso),
                    descricaoOrgaoJulgador: unescape(audit.descricaoOrgaoJulgador),
                    nomeParteAutora: unescape(audit.nomeParteAutora),
                    nomeParteRe: unescape(audit.nomeParteRe),
                    dataAutuacao: unescape(audit.dataArquivamento),
                });
            });

            const excelDataIdentified = {
                excelData,
                identifier
            }
            await browser.close()


            return excelDataIdentified

        } catch (error) {
            await browser.close()

            const identifier: apiResponseAcervoGeralProps["identifier"] = {
                trt: `TRT-${trt}`,
                grau: grau
            }

            const emptyJson: apiResponseAcervoGeralProps = {
                excelData: [{
                    type: 'Acervo geral',
                    usuario: credentials.user,
                    numeroProcesso: 'erro',
                    descricaoOrgaoJulgador: 'erro',
                    nomeParteAutora: 'erro',
                    nomeParteRe: 'erro',
                    dataAutuacao: 'erro',
                }],
                identifier
            }
            return emptyJson
        }

    } catch (error) {
        throw error
    }

}