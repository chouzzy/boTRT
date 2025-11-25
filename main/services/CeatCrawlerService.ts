import { BrowserWindow } from 'electron';
import { Browser } from 'puppeteer';
import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
const PCR = require("puppeteer-chromium-resolver");
import { startPuppeteer } from '../helpers/puppeteer/puppeteerHelpers';

// Função auxiliar para enviar progresso para o frontend
function sendProgress(win: BrowserWindow, message: string) {
    if (win && !win.isDestroyed()) {
        win.webContents.send('progress-messages-details', { message });
    }
}

interface CeatCrawlerProps {
    cnpj: string;
}

// A função principal do serviço
export async function CeatCrawlerService(mainWindow: BrowserWindow, { cnpj }: CeatCrawlerProps): Promise<any[]> {
    let browser: Browser | null = null;
    const tempDir = path.join(os.tmpdir(), `botrt-ceat-${Date.now()}`);
    await fs.ensureDir(tempDir);

    try {
        sendProgress(mainWindow, 'Iniciando automação CEAT...');
        
        const puppeteerSession = await startPuppeteer(false);
        browser = puppeteerSession.browser;
        const page = puppeteerSession.page;
        
        sendProgress(mainWindow, 'Acessando portal do TRT-15...');
        await page.goto('https://ceat.trt15.jus.br/ceat/certidaoAction.seam', { waitUntil: 'networkidle2' });

        sendProgress(mainWindow, `Inserindo CNPJ: ${cnpj}`);
        await page.waitForSelector('::-p-xpath(//*[@id="certidaoActionForm:j_id23:doctoPesquisa"])', { visible: true });
        await page.type('::-p-xpath(//*[@id="certidaoActionForm:j_id23:doctoPesquisa"])', cnpj);
        
        sendProgress(mainWindow, 'Resolvendo captcha...');
        await page.waitForSelector('::-p-xpath(//*[@id="certidaoActionForm:j_id51"]/div/span[1]/img)', { visible: true });
        const captchaElement = await page.$('::-p-xpath(//*[@id="certidaoActionForm:j_id51"]/div/span[1]/img)');
        if (!captchaElement) throw new Error('Elemento do captcha não encontrado.');

        const captchaPath = path.join(tempDir, 'captcha.png');
        await captchaElement.screenshot({ path: captchaPath });

        const worker = await createWorker('por');
        const { data: { text } } = await worker.recognize(captchaPath);
        await worker.terminate();

        const cleanText = text.replace(/[^0-9+*-]/g, '').trim();
        if (!cleanText) throw new Error(`Não foi possível ler o texto do captcha. Tente novamente.`);

        const result = new Function('return ' + cleanText)();
        if (isNaN(result)) throw new Error(`Falha ao calcular o resultado do captcha. Texto lido: ${text}`);

        sendProgress(mainWindow, `Captcha resolvido: ${cleanText} = ${result}`);
        await page.type('::-p-xpath(//*[@id="certidaoActionForm:j_id51:verifyCaptcha"])', String(result));

        sendProgress(mainWindow, 'Enviando formulário e aguardando PDF...');
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: tempDir,
        });

        await page.waitForSelector('::-p-xpath(//*[@id="certidaoActionForm:certidaoActionEmitir"])', { visible: true, timeout: 60000 });
        await page.click('::-p-xpath(//*[@id="certidaoActionForm:certidaoActionEmitir"])');
        console.log('[LOG] Botão "Emitir Certidão" clicado.');

        await page.waitForSelector('::-p-xpath(//*[@id="certidaoActionForm:certidaoActionImprimir"])', { visible: true, timeout: 60000 });
        await page.click('::-p-xpath(//*[@id="certidaoActionForm:certidaoActionImprimir"])');
        console.log('[LOG] Botão "Imprimir" clicado, aguardando download...');

        await new Promise(resolve => setTimeout(resolve, 10000));
        sendProgress(mainWindow, 'Download do PDF concluído.');

        // --- Extração de Dados do PDF ---
        const files = await fs.readdir(tempDir);
        const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
        if (!pdfFile) throw new Error('Nenhum arquivo PDF foi encontrado. O site pode estar instável ou o CNPJ é inválido.');

        sendProgress(mainWindow, `Lendo arquivo: ${pdfFile}`);
        const dataBuffer = await fs.readFile(path.join(tempDir, pdfFile));

        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        await parser.destroy();

        console.log('[LOG] PDF processado com sucesso! Iniciando extração do texto.');
        const pdfText = data.text;
        
        console.log("--- TEXTO EXTRAÍDO DO PDF ---");
        console.log(pdfText);
        console.log("-----------------------------");

        // ✨ LÓGICA DE EXTRAÇÃO CORRIGIDA ✨
        // Removemos a busca por "blocos" e agora procuramos as informações
        // no texto completo, o que é mais robusto para PDFs com texto desordenado.
        sendProgress(mainWindow, 'Extraindo processos do texto...');
        
        // 1. Encontra todas as "Varas" no texto completo
        const varaRegex = /.+?Vara do Trabalho de .+/g;
        const varasFound = pdfText.match(varaRegex) || [];
        console.log(`[LOG] Varas encontradas: ${varasFound.length}`, varasFound);

        // 2. Encontra todos os "Processos" (número + tipo) no texto completo
        const processoRegex = /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\s(.+)/g;
        const processosFound = [...pdfText.matchAll(processoRegex)];
        console.log(`[LOG] Processos encontrados: ${processosFound.length}`, processosFound);

        const extractedData = [];
        
        // 3. Combina as duas listas se o número de itens for o mesmo
        if (varasFound.length > 0 && varasFound.length === processosFound.length) {
            for (let i = 0; i < varasFound.length; i++) {
                const vara = varasFound[i];
                const processoMatch = processosFound[i];
                const numero_processo = processoMatch[1];
                const tipo_processo = processoMatch[2];

                extractedData.push({
                    cnpj_consultado: cnpj,
                    vara_do_trabalho: vara.trim(),
                    numero_processo: numero_processo.trim(),
                    tipo_processo: tipo_processo.trim(),
                });
            }
        } else if (pdfText.includes("não foram encontrados processos")) {
            sendProgress(mainWindow, 'Nenhum processo encontrado na certidão (mensagem de confirmação encontrada).');
        } 
        else {
            console.log('[LOG] AVISO: A contagem de Varas e Processos não coincide. A extração pode estar incompleta ou o formato do PDF é inesperado.');
        }

        sendProgress(mainWindow, `${extractedData.length} processo(s) extraído(s) com sucesso!`);
        return extractedData;

    } catch (error: any) {
        console.error('Erro durante o processo CEAT:', error);
        sendProgress(mainWindow, `ERRO: ${error.message}`);
        throw error;
    } finally {
        if (browser) await browser.close();
        await fs.remove(tempDir);
        console.log('[LOG] Sessão finalizada e arquivos temporários removidos.');
    }
}

