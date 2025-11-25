import { BrowserWindow } from 'electron';
import { startPuppeteer } from '../helpers/puppeteer/puppeteerHelpers';
// import { totp } from 'otplib';

interface TestMFAProps {
    user: string;
    pass: string;
    secretKey: string;
}

function log(win: BrowserWindow, msg: string) {
    console.log(`[TEST-MFA] ${msg}`);
    if (win && !win.isDestroyed()) {
        win.webContents.send('progress-messages-details', { message: msg });
    }
}

export async function TestMFAService(mainWindow: BrowserWindow, { user, pass, secretKey }: TestMFAProps) {
    let browser = null;
    try {
        log(mainWindow, 'Iniciando Puppeteer...');
        const session = await startPuppeteer(false); // Headless false para você ver
        browser = session.browser;
        const page = session.page;

        log(mainWindow, 'Acessando PJe (TRT-15)...');
        await page.goto('https://pje.trt15.jus.br/pje/login.seam');

        // 1. Entrar com PJe
        log(mainWindow, 'Clicando no botão SSO...');
        await page.waitForSelector('#btnSsoPdpj', { visible: true });
        await page.click('#btnSsoPdpj');

        // 2. Preencher Credenciais
        log(mainWindow, 'Preenchendo usuário e senha...');
        await page.waitForSelector('#username', { visible: true });
        await page.type('#username', user);
        await page.type('#password', pass);

        // 3. Clicar em Entrar
        log(mainWindow, 'Enviando credenciais...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('#kc-login')
        ]);

        // 4. Detectar Tela de MFA
        log(mainWindow, 'Aguardando tela de MFA...');
        try {
            await page.waitForSelector('#otp', { visible: true, timeout: 10000 });
        } catch (e) {
            throw new Error("O campo de código MFA (#otp) não apareceu. Verifique usuário/senha ou se o MFA está ativado.");
        }

        // 5. GERAR CÓDIGO (A Mágica)
        log(mainWindow, `Gerando código para chave: ${secretKey.substring(0, 5)}...`);
        
        // Configura explicitamente para SHA1 (padrão PJe)
        // totp.options = { algorithm: 'sha1', digits: 6, period: 30 };
        
        const token = totp.generate(secretKey);
        log(mainWindow, `>>> CÓDIGO GERADO: ${token} <<<`);

        // 6. Digitar e Enviar
        await page.type('#otp', token);
        await new Promise(r => setTimeout(r, 500)); // Pausa visual

        log(mainWindow, 'Enviando código MFA...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('#kc-login')
        ]);

        // 7. Validar Sucesso
        log(mainWindow, 'Verificando se logou...');
        try {
            // Procura o painel do usuário ou brasão
            await page.waitForSelector('#brasao-republica', { visible: true, timeout: 10000 });
            log(mainWindow, 'BRASÃO ENCONTRADO! Login bem sucedido.');
            return { success: true };
        } catch (e) {
            log(mainWindow, 'Falha: Não encontrou o brasão após o login.');
            
            const errorMsg = await page.evaluate(() => {
                const el = document.querySelector('.kc-feedback-text');
                return el ? el.textContent : null;
            });
            
            if (errorMsg) {
                throw new Error(`PJe retornou erro: ${errorMsg}`);
            }
            throw new Error("Login falhou por motivo desconhecido.");
        }

    } catch (error: any) {
        log(mainWindow, `ERRO: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            log(mainWindow, 'Fechando navegador em 5 segundos...');
            await new Promise(r => setTimeout(r, 5000));
            await browser.close();
        }
    }
}