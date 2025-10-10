// import { BrowserWindow } from 'electron';
// import { Browser } from 'puppeteer';
// import puppeteer from 'puppeteer-core'; // Usar puppeteer-core é uma boa prática com Electron
// import { createWorker } from 'tesseract.js';
// import pdf from 'pdf-parse';
// import fs from 'fs-extra';
// import path from 'path';
// import os from 'os';
// import { executablePath as getChromePath } from 'puppeteer-chromium-resolver'; // Um resolver robusto para o path
// import { startPuppeteer } from '../helpers/puppeteer/puppeteerHelpers';

// // Função auxiliar para enviar progresso para o frontend
// function sendProgress(win: BrowserWindow, message: string) {
//     if (win && !win.isDestroyed()) {
//         win.webContents.send('progress-messages-details', { message });
//     }
// }

// interface CeatCrawlerProps {
//     cnpj: string;
// }

// // A função principal do serviço, agora com a nomenclatura e assinatura corretas
// export async function CeatCrawlerService(mainWindow: BrowserWindow, { cnpj }: CeatCrawlerProps): Promise<any[]> {
//     let browser: Browser | null = null;
//     const tempDir = path.join(os.tmpdir(), `botrt-ceat-${Date.now()}`);
//     await fs.ensureDir(tempDir);

//     try {
//         sendProgress(mainWindow, 'Iniciando automação CEAT...');
//         const executablePath = await getChromePath();
//         const { page, browser } = await startPuppeteer(false)
        
//         sendProgress(mainWindow, 'Acessando portal do TRT-15...');
//         await page.goto('https://trt15.jus.br/servicos/certidoes/certidao-eletronica-de-acoes-trabalhistas-ceat', { waitUntil: 'networkidle2' });

//         sendProgress(mainWindow, `Inserindo CNPJ: ${cnpj}`);
//         await page.type('#p_p_id_br_jus_trt15_portlet_ceat_CEATPortlet_ > div > div > div > form > div > div:nth-child(1) > div > input', cnpj);

//         // --- Resolução do Captcha ---
//         sendProgress(mainWindow, 'Resolvendo captcha...');
//         const captchaElement = await page.$('#img-captcha');
//         if (!captchaElement) throw new Error('Elemento do captcha não encontrado.');

//         const captchaPath = path.join(tempDir, 'captcha.png');
//         await captchaElement.screenshot({ path: captchaPath });

//         const worker = await createWorker('por');
//         const { data: { text } } = await worker.recognize(captchaPath);
//         await worker.terminate();

//         const cleanText = text.replace(/[^0-9+*-]/g, '');
//         if (!cleanText) throw new Error(`Não foi possível ler o texto do captcha. Tente novamente.`);

//         const captchaResult = eval(cleanText);
//         if (isNaN(captchaResult)) throw new Error(`Falha ao calcular o resultado do captcha. Texto lido: ${text}`);

//         sendProgress(mainWindow, `Captcha resolvido: ${cleanText} = ${captchaResult}`);
//         await page.type('#captcha-text', String(captchaResult));

//         // --- Download do PDF ---
//         sendProgress(mainWindow, 'Enviando formulário e aguardando PDF...');
//         const client = await page.target().createCDPSession();
//         await client.send('Page.setDownloadBehavior', {
//             behavior: 'allow',
//             downloadPath: tempDir,
//         });

//         await page.click('button[type="submit"]');

//         // Aguarda um pouco para o download começar e finalizar
//         await new Promise(resolve => setTimeout(resolve, 10000)); // Espera 10 segundos
//         sendProgress(mainWindow, 'Download do PDF concluído.');

//         // --- Extração de Dados do PDF ---
//         const files = await fs.readdir(tempDir);
//         const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
//         if (!pdfFile) throw new Error('Nenhum arquivo PDF foi encontrado. O site pode estar instável ou o CNPJ é inválido.');

//         sendProgress(mainWindow, `Lendo arquivo: ${pdfFile}`);
//         const dataBuffer = await fs.readFile(path.join(tempDir, pdfFile));
//         const data = await pdf(dataBuffer);

//         const pdfText = data.text;
//         const startMarker = "foram encontrados os seguintes processos:";
//         const endMarker = "O andamento processual poderá ser consultado";

//         const startIndex = pdfText.indexOf(startMarker);

//         if (startIndex === -1) {
//             sendProgress(mainWindow, 'Nenhum processo encontrado na certidão.');
//             return []; // Retorna um array vazio se não houver processos
//         }

//         const endIndex = pdfText.indexOf(endMarker, startIndex);
//         const processesBlock = pdfText.substring(startIndex + startMarker.length, endIndex).trim();
//         sendProgress(mainWindow, 'Extraindo processos do texto...');

//         const processRegex = /(.+?Vara do Trabalho.+?)\s*?\n\s*?(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\s(.+)/g;
//         let match;
//         const extractedData = [];

//         while ((match = processRegex.exec(processesBlock)) !== null) {
//             const [_, vara, numero_processo, tipo_processo] = match;
//             extractedData.push({
//                 cnpj_consultado: cnpj,
//                 vara_do_trabalho: vara.trim(),
//                 numero_processo: numero_processo.trim(),
//                 tipo_processo: tipo_processo.trim(),
//             });
//         }
//         sendProgress(mainWindow, `${extractedData.length} processo(s) extraído(s) com sucesso!`);
//         return extractedData;

//     } catch (error) {
//         console.error('Erro durante o processo CEAT:', error);
//         sendProgress(mainWindow, `ERRO: ${error.message}`);
//         throw error;
//     } finally {
//         if (browser) await browser.close();
//         await fs.remove(tempDir);
//     }
// }
