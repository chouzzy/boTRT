import { unescape } from "he";
import * as OTPAuth from 'otpauth';
import { AudienciaSimplificada, excelDataIdentified } from "../../../types/audiencias";
import { credentials, dateSelected, PuppeteerCallback, ScrapeData } from "../../../types/generalTypes";
import { scrapeURL } from "../scrapeURL";
import { ApiMinhaPautaResponse } from "./apiMinhaPautaTypes";
import { timeoutDelay } from "../../converters/timeOutDelay";
import { requestMfaCode } from "../../../ipcHandlers/ipcHandlers";
import { extractMfaSecret } from "../../mfa/MfaUtils";


export async function consumeMinhaPautaApi(
    chaveSecretaMFA_Input: string,
    painel: ScrapeData["painel"],
    dateSelected: dateSelected,
    grau: string,
    trt: number,
    credentials: credentials,
    startPuppeteer: PuppeteerCallback,
    mainWindow: Electron.CrossProcessExports.BrowserWindow,
) {

    try {


        const { page, browser } = await startPuppeteer(false)
        const chaveSecretaMFA = extractMfaSecret(chaveSecretaMFA_Input);

        // Try para navegação e para identificação do tipo de Login e Ação de login
        try {
            // Teste de acesso ao TRT (aqui eliminamos a hipotese de um TRT inexistente)
            try {
                await page.goto(`https://pje.trt${trt}.jus.br/${grau}/login.seam`);
            } catch (error) {
                throw error
            } finally {
                console.log('finally-mp')
            }

            let seletorDeLoginEncontrado = false;
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
                console.log('[Login] Login padrão não encontrado. Tentando fluxo PDPJ (MFA)...');

                if (!seletorDeLoginEncontrado) {
                    // 1. Acessando PDPJ
                    await page.waitForSelector('::-p-xpath(//*[@id="btnSsoPdpj"])', { timeout: 30000, visible: true });
                    await page.click('::-p-xpath(//*[@id="btnSsoPdpj"])');
                    console.log('[Login] Clicou em "Entrar com PJe"');

                    // 2. Fazendo login no PDPJ
                    await page.waitForSelector('::-p-xpath(//*[@id="username"])', { timeout: 30000, visible: true });
                    await page.type('::-p-xpath(//*[@id="username"])', user);
                    await page.type('::-p-xpath(//*[@id="password"])', password);
                    console.log('[Login] Preencheu usuário e senha.');

                    // 3. Clicando no botão de login
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
                        page.click('::-p-xpath(//*[@id="kc-login"])')
                    ]);
                    console.log('[Login] Clicou no botão de login. Página de MFA deve carregar.');

                    // 4. Loop de validação do MFA (AUTOMÁTICO)
                    let mfaCodeValid = false;
                    // ✨ Adicionado limite de tentativas para não ficar infinito se a chave estiver errada
                    let attempts = 0;

                    while (!mfaCodeValid && attempts < 5) {
                        attempts++;

                        // 5. Espera o campo OTP aparecer
                        try {
                            await page.waitForSelector('::-p-xpath(//*[@id="otp"])', { timeout: 60000, visible: true });
                        } catch (e) {
                            // Se não apareceu OTP, pode ser que já logou direto (sessão salva)
                            console.log('[Login] Campo OTP não apareceu. Verificando se já logou...');
                            break;
                        }

                        // 6. ✨ A MÁGICA: GERAÇÃO AUTOMÁTICA DO CÓDIGO ✨
                        console.log(`[Login] Gerando código MFA (Tentativa ${attempts})...`);
                        mainWindow.webContents.send('progress-messages', { message: `Gerando código de acesso para o TRT-${trt}...` });

                        if (!chaveSecretaMFA) {
                            // Se não tiver chave, lança erro que será pego pelo catch de autenticação lá embaixo
                            throw new Error("Chave MFA não encontrada na planilha. Configure o MFA.");
                        }

                        // Configura o gerador TOTP com 'otpauth'
                        const totp = new OTPAuth.TOTP({
                            algorithm: "SHA1",
                            digits: 6,
                            period: 30,
                            secret: OTPAuth.Secret.fromBase32(chaveSecretaMFA)
                        });

                        // Proteção de Tempo: Espera se o código estiver para vencer (menos de 5s)
                        const seconds = Math.floor(Date.now() / 1000);
                        const timeRemaining = 30 - (seconds % 30);

                        if (timeRemaining < 5) {
                            console.log(`[Login] Código expirando em ${timeRemaining}s. Aguardando próximo...`);
                            mainWindow.webContents.send('progress-messages', { message: `Sincronizando relógio do código...` });
                            await new Promise(r => setTimeout(r, (timeRemaining + 1) * 3000));
                        }

                        const token = totp.generate();
                        console.log(`[Login] Código gerado: ${token}`);

                        // 7. Digita o código novo (e limpa o campo antes)
                        await page.evaluate(() => {
                            const otpInput = document.querySelector('#otp') as HTMLInputElement;
                            if (otpInput) otpInput.value = '';
                        });
                        // Digita devagar para o JS pegar
                        await page.type('::-p-xpath(//*[@id="otp"])', token, { delay: 100 });
                        await new Promise(r => setTimeout(r, 5000));

                        // 8. Clica para logar e espera a resposta
                        console.log('[Login] Clicando no login após inserir o MFA...');
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
                            page.click('::-p-xpath(//*[@id="kc-login"])')
                        ]);

                        try {
                            await page.waitForSelector('#brasao-republica', { visible: true, timeout: 30000 });
                        } catch (error) {
                            console.log('[Login] Falha no login com o código MFA fornecido. Tentando novamente...');
                            mainWindow.webContents.send('progress-messages', { message: `🛑🛑🛑 Código MFA inválido. Por favor, tente novamente.` });

                            continue; // Volta para o início do loop para pedir o código novamente
                        }
                        console.log('[Login] Clique realizado. Verificando sucesso do login...');
                        mainWindow.webContents.send('progress-messages', { message: `Código MFA inserido com sucesso, aguardando resposta do PJE...` });
                        mfaCodeValid = true; // <-- QUEBRA O LOOP

                    } // FIM DO WHILE

                    if (!mfaCodeValid && attempts >= 5) {
                        throw new Error("Falha no login MFA após 5 tentativas. Verifique se a Chave Secreta na planilha está correta.");
                    }

                    // O robô agora está logado e pode continuar o scrape...
                }
            }

            mainWindow.webContents.send(
                'progress-messages',
                `Buscando dados no TRT-${trt}...`
            );

            // CATCH PARA ERRO DE AUTENTICAÇÃO
        } catch (error: any) {
            console.log('erro de autenticação', error.message);
            mainWindow.webContents.send('progress-messages', { message: `Ocorreu um erro de autenticação no TRT-${trt}, seguindo para o próximo da lista...` });

            // Se o erro for de Chave MFA, avisa especificamente
            let msgErro = `Ocorreu um erro de autenticação no TRT-${trt}.`;
            if (error.message.includes("Chave MFA")) msgErro = "Erro: Chave MFA inválida ou ausente na planilha.";

            const identifier: excelDataIdentified["identifier"] = { trt: `TRT-${trt}`, grau: grau };
            const loginErrorJson: excelDataIdentified = {
                excelData: [{
                    type: 'Minha pauta', usuario: credentials.user, numeroProcesso: 'Erro de autenticação',
                    orgaoJulgador: 'Erro de autenticação', tipoAudiencia: 'Erro de autenticação',
                    dataInicio: 'Erro de autenticação', dataFim: 'Erro de autenticação',
                    poloAtivo: 'Erro de autenticação', poloPassivo: 'Erro de autenticação',
                }],
                identifier
            };
            mainWindow.webContents.send('progress-messages', `${msgErro} Seguindo...`);
            await browser.close();
            return loginErrorJson;
        }

        // Try para teste de autenticação (caso login e senha estejam incorretos, o brasão não aparece)
        try {
            console.log('teste de autenticação')
            await page.waitForSelector('#brasao-republica', { visible: true })
            mainWindow.webContents.send('progress-messages', { message: `🔑🔑🔑 TRT-${trt} autenticado com sucesso, fazendo a busca dos processos da minha pauta...` });

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

            const url = await scrapeURL(painel, trt, 1000, grau, dateSelected)


            await page.goto(url);

            try {
                await page.waitForSelector('pre');

            } catch (error) {
                throw error
            }

            const html = await page.$eval('pre', (el: HTMLPreElement) => el.textContent);

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