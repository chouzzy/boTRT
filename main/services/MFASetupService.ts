import { BrowserWindow } from 'electron';
import { startPuppeteer } from '../helpers/puppeteer/puppeteerHelpers';
// ✨ TROCA DE BIBLIOTECA: Sai otplib, entra otpauth ✨
import * as OTPAuth from 'otpauth';
import {Jimp} from 'jimp';
import jsQR from 'jsqr';
import Store from 'electron-store'; 

const store = new Store({ name: 'auth_session' });

interface MfaSetupProps {
    user: string;
    pass: string;
}

function log(win: BrowserWindow, msg: string) {
    console.log(`[MFA-SETUP] ${msg}`);
    if (win && !win.isDestroyed()) {
        win.webContents.send('progress-messages-details', { message: msg });
    }
}

export async function MfaSetupService(mainWindow: BrowserWindow, { user, pass }: MfaSetupProps) {
    let browser = null;
    try {
        log(mainWindow, 'Iniciando configuração automática de MFA...');
        const session = await startPuppeteer(false);
        browser = session.browser;
        const page = session.page;

        // 1. Acessar o PJe
        log(mainWindow, 'Acessando PJe para cadastro...');
        await page.goto('https://pje.trt1.jus.br/primeirograu/login.seam');

        // 2. Login Inicial
        log(mainWindow, 'Realizando login...');
        try {
            await page.waitForSelector('::-p-xpath(//*[@id="btnSsoPdpj"])', { timeout: 15000, visible: true });
            await page.click('::-p-xpath(//*[@id="btnSsoPdpj"])');
            console.log('[Login] Clicou em "Entrar com PJe"');

            await page.waitForSelector('::-p-xpath(//*[@id="username"])', { timeout: 15000, visible: true });
            await page.type('::-p-xpath(//*[@id="username"])', user);
            await page.type('::-p-xpath(//*[@id="password"])', pass);
            console.log('[Login] Preencheu usuário e senha.');

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
                page.click('::-p-xpath(//*[@id="kc-login"])')
            ]);
            console.log('[Login] Clicou no botão de login. Página de MFA deve carregar.');

        } catch (e: any) {
            log(mainWindow, 'Erro no login inicial. Verifique as credenciais.');
            throw e;
        }

        // ✨ LOOP DE RETENTATIVA ✨
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let finalSecretKey = '';

        while (attempts < maxAttempts && !success) {
            attempts++;
            log(mainWindow, `Tentativa de configuração ${attempts}/${maxAttempts}...`);

            try {
                // 3. Tentar obter a Chave Secreta
                log(mainWindow, 'Buscando chave secreta na tela...');

                // Espera a tela carregar
                try {
                    await page.waitForFunction(() => {
                        return document.querySelector('img[src^="data:image/png;base64"]') || 
                               document.querySelector('#mode-manual');
                    }, { timeout: 20000 });
                } catch (e) {
                    throw new Error("Não encontrei a tela de cadastro de MFA. Verifique se a conta já não possui MFA ativo.");
                }

                let textKeyFound = false;

                // --- ESTRATÉGIA A: MODO MANUAL (TEXTO) ---
                try {
                    const manualBtnSelector = '::-p-xpath(//*[@id="mode-manual"])';
                    const manualBtn = await page.$(manualBtnSelector);

                    if (manualBtn) {
                        log(mainWindow, 'Clicando em "Não foi possível ler o QRCode?"...');
                        await manualBtn.click();

                        const keySelector = '::-p-xpath(//*[@id="kc-totp-secret-key"])';
                        await page.waitForSelector(keySelector, { visible: true, timeout: 5000 });
                        
                        const keyElement = await page.$(keySelector);
                        const rawKey = await page.evaluate((el: { textContent: any; }) => el.textContent, keyElement);

                        if (rawKey) {
                            finalSecretKey = rawKey.replace(/\s/g, '').toUpperCase();
                            log(mainWindow, `Chave de texto encontrada: ${finalSecretKey.substring(0, 5)}...`);
                            textKeyFound = true;
                        }
                    }
                } catch (e) {
                    console.log('Falha na estratégia de texto, tentando QR Code...', e);
                }

                // --- ESTRATÉGIA B: QR CODE ---
                // if (!textKeyFound) {
                //     log(mainWindow, 'Tentando ler QR Code da imagem...');
                //     const imgSelector = 'img[src^="data:image/png;base64"]';
                //     await page.waitForSelector(imgSelector, { visible: true, timeout: 5000 });
                    
                //     const imgSrc = await page.$eval(imgSelector, (el: HTMLImageElement) => (el as HTMLImageElement).src);
                //     const base64Data = imgSrc.replace(/^data:image\/png;base64,/, "");
                //     const buffer = Buffer.from(base64Data, 'base64');
                    
                //     const image = await Jimp.read(buffer);
                //     const qrCodeData = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);

                //     if (!qrCodeData) throw new Error("Falha ao ler os dados do QR Code.");

                //     const uri = qrCodeData.data;
                //     const secretMatch = uri.match(/secret=([^&]*)/);
                //     if (!secretMatch) throw new Error("QR Code lido, mas sem Chave Secreta válida.");
                    
                //     finalSecretKey = secretMatch[1];
                //     log(mainWindow, `Chave extraída do QR Code: ${finalSecretKey.substring(0, 5)}...`);
                // }

                // 5. Gerar Código com 'otpauth' (A MUDANÇA)
                
                // Configura o objeto TOTP
                const totp = new OTPAuth.TOTP({
                    issuer: "PJe",
                    label: user,
                    algorithm: "SHA1",
                    digits: 6,
                    period: 30,
                    secret: OTPAuth.Secret.fromBase32(finalSecretKey) // Converte a chave corretamente
                });

                // Cálculo manual do tempo restante (30 - (segundos atuais % 30))
                const seconds = Math.floor(Date.now() / 1000);
                const timeRemaining = 30 - (seconds % 30);

                if (timeRemaining < 8) {
                    log(mainWindow, `Aguardando novo ciclo de tempo (${timeRemaining}s restantes)...`);
                    await new Promise(r => setTimeout(r, (timeRemaining + 1) * 1000));
                }

                const token = totp.generate();
                log(mainWindow, `Código gerado (otpauth): ${token}`);

                // 6. Preencher
                await page.evaluate(() => {
                    const input = document.querySelector('#totp') || document.querySelector('#otp');
                    if (input) (input as HTMLInputElement).value = '';
                });

                const otpInputSelector = await page.$('#totp') ? '#totp' : '#otp';
                await page.type(otpInputSelector, token, { delay: 100 });
                await new Promise(r => setTimeout(r, 1000));

                // 7. Salvar
                log(mainWindow, 'Confirmando cadastro...');
                const saveBtnSelector = await page.$('#saveTOTPBtn') ? '#saveTOTPBtn' : '#btnConfirmar';
                await page.click(saveBtnSelector);

                // 8. Validar Sucesso
                log(mainWindow, 'Verificando resultado...');
                await new Promise(r => setTimeout(r, 3000));

                const saveBtnStillExists = await page.$(saveBtnSelector);
                
                if (!saveBtnStillExists) {
                    success = true;
                    log(mainWindow, '✅ Botão de salvar desapareceu. Cadastro assumido com sucesso!');
                } else {
                    const errorMsg = await page.evaluate(() => {
                        const el = document.querySelector('.ui-messages-error-detail, .rf-msg-err, .kc-feedback-text, #kc-content-wrapper > div:nth-child(4) > span');
                        return el ? el.textContent?.trim() : null;
                    });
                    
                    log(mainWindow, `⚠️ Falha na tentativa ${attempts}. Erro na tela: ${errorMsg || "Código inválido"}`);
                    
                    if (attempts < maxAttempts) {
                        log(mainWindow, 'Aguardando 15 segundos para tentar novamente...');
                        await new Promise(r => setTimeout(r, 15000));
                    }
                }

            } catch (innerError: any) {
                log(mainWindow, `⚠️ Erro técnico na tentativa ${attempts}: ${innerError.message}`);
                if (innerError.message.includes("Não encontrei a tela")) throw innerError;
                
                if (attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        }

        if (success) {
            store.set(`mfa_secret_${user}`, finalSecretKey);
            return { success: true, secretKey: finalSecretKey };
        } else {
            throw new Error("Falha ao configurar MFA. O PJe não aceitou os códigos gerados.");
        }

    } catch (error: any) {
        log(mainWindow, `❌ ERRO FINAL: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        // if (browser) await browser.close(); 
    }
}