import PCR from "puppeteer-chromium-resolver";
// app/services/CrawlerService.ts
import { BrowserWindow, dialog } from 'electron';
import exceljs from 'exceljs';
import { trtDict } from '../helpers/converters/trtDict'; // Ajuste de caminho
import { format } from 'date-fns';
import { saveErrorLog } from '../helpers/logUtils'; // Se
import { startPuppeteer } from "../helpers/puppeteer/puppeteerHelpers";
import { scrapeAcervoGeral } from "../helpers/scrape/acervoGeral/scrapeAcervoGeral";
import { scrapeMinhaPauta } from "../helpers/scrape/minhaPauta/scrapeMinhaPauta";
import { scrapeArquivados } from "../helpers/scrape/processosArquivados/scrapeArquivados";
import { AcervoGeralSimplificado, apiResponseAcervoGeralProps, AudienciaSimplificada } from "../types/acervoGeral";
import { scrapeDataListProps, ScrapeData } from "../types/generalTypes";
import { apiResponseArquivadosProps, excelDataIdentified, ProcessosArquivadosSimplificado } from "../types/audiencias";

import moment from "moment";


interface CrawlerResponse {
    stats: any;
}

export async function initializeCrawlerService(): Promise<CrawlerResponse> {
    const options = {};
    const stats = await PCR(options);

    return stats
}

// Variável para armazenar os dados raspados temporariamente
let lastScrapedData: any[][] | null = null; // Use um tipo mais específico se possível
let lastOperationType: string | null = null;

export async function MainBostExcelService(mainWindow: BrowserWindow, excelPath: Buffer<ArrayBufferLike>, operationType: string) {
    mainWindow.webContents.send('is-loading', true);
    mainWindow.webContents.send('progress-messages', { message: `Lendo planilha: ${excelPath}...` });

    try {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(excelPath);
        const worksheet = workbook.worksheets[0];

        let scrapeDataList: scrapeDataListProps[] = [];
        let expectedHeaders: string[] = [];
        let headerErrorCode: string = 'ASC_Genérico';

        switch (operationType) {
            case "Minha pauta":
                expectedHeaders = ['Selecione o TRT', 'Data inicial', 'Data final', 'Usuário', 'Senha'];
                headerErrorCode = 'ASC_7';
                break;
            case "Processos arquivados":
                expectedHeaders = ['Selecione o TRT', 'Data inicial', 'Data final', 'Usuário', 'Senha']; // Ajuste se os headers forem diferentes
                headerErrorCode = 'ASC_1';
                break;
            case "Acervo geral":
                expectedHeaders = ['Selecione o TRT', 'Data inicial', 'Data final', 'Usuário', 'Senha']; // Ajuste se os headers forem diferentes
                headerErrorCode = 'ASC_AG'; // Crie um código de erro para este
                break;
            default:
                throw new Error("Tipo de operação não reconhecido no Excel.");
        }

        // Verificar cabeçalhos
        let headersOk = true;
        for (let i = 0; i < expectedHeaders.length; i++) {
            if (worksheet.getCell(1, i + 1).value !== expectedHeaders[i]) {
                headersOk = false;
                break;
            }
        }

        if (!headersOk) {
            console.error(`Cabeçalhos errados para ${operationType}`);
            mainWindow.webContents.send('invalid-excel-format', `Erro ${headerErrorCode}: Problema com os cabeçalhos da planilha. Verifique o modelo.`);
            throw new Error(`Cabeçalhos inválidos para ${operationType}`);
        }
        console.log(`Cabeçalhos OK para ${operationType}`);

        // Ler dados das linhas
        // Usar um loop for tradicional para poder usar await dentro dele corretamente
        console.log(`worksheet.rowCount ${worksheet.rowCount}`)
        let actualRowCountWithData = 0;

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {

            console.log('1')
            const row = worksheet.getRow(rowNumber);
            console.log('2')

            const trtCell = row.values[1];
            if (!trtCell || String(trtCell).trim() === "") {
                console.log(`Linha ${rowNumber} considerada vazia (sem TRT). Parando leitura da planilha.`);
                break; // Interrompe o loop for
            }
            actualRowCountWithData = rowNumber; // Atualiza a última linha com dados encontrados
            // @ts-ignore
            const trt = (JSON.stringify(row.values[1])).replace(/"/g, '');
            console.log('3')
            // @ts-ignore
            const initialDateRaw = row.values[2];
            console.log('4')
            // @ts-ignore
            const finalDateRaw = row.values[3];
            console.log('5')
            // @ts-ignore
            const username = (JSON.stringify(row.values[4])).replace(/"/g, '');
            console.log('6')
            // @ts-ignore
            const password = (JSON.stringify(row.values[5])).replace(/"/g, '');
            console.log('7')

            // Validação básica (ex: verificar se trt, username, password existem)
            if (!trt || !username || !password || !initialDateRaw || !finalDateRaw) {
                console.warn(`Linha ${rowNumber} pulada devido a dados ausentes.`);
                continue;
            }

            const initialDate = new Date(initialDateRaw).toLocaleString('en-US', { timeZone: 'UTC' });
            const finalDate = new Date(finalDateRaw).toLocaleString('en-US', { timeZone: 'UTC' });

            scrapeDataList.push({
                trt,
                // @ts-ignore
                trtNumber: trtDict[trt],
                username,
                password,
                date: {
                    initial: {
                        day: new Date(initialDate).getDate().toString().padStart(2, '0'),
                        month: (new Date(initialDate).getMonth() + 1).toString().padStart(2, '0'),
                        year: new Date(initialDate).getFullYear().toString(),
                    },
                    final: {
                        day: new Date(finalDate).getDate().toString().padStart(2, '0'),
                        month: (new Date(finalDate).getMonth() + 1).toString().padStart(2, '0'),
                        year: new Date(finalDate).getFullYear().toString(),
                    }
                }
            });
        }

        mainWindow.webContents.send('progress-messages', { message: `Planilha lida. Iniciando ${scrapeDataList.length} buscas...` });

        let allScrapedResults: excelDataIdentified[][] = []; // Tipo genérico por enquanto
        const totalItems = scrapeDataList.length;
        let processedItems = 0;

        for (const scrapeParams of scrapeDataList) {
            const { trtNumber, date, username, password } = scrapeParams;
            let currentScrapedData: excelDataIdentified[] | apiResponseArquivadosProps[] | apiResponseAcervoGeralProps[] = [];
            mainWindow.webContents.send('progress-messages', { message: `Buscando TRT: ${scrapeParams.trt}, Usuário: ${username}` });
            switch (operationType) {
                case "Minha pauta":
                    (currentScrapedData as excelDataIdentified[]) = await scrapeMinhaPauta(operationType, date, { user: username, password }, trtNumber, startPuppeteer, mainWindow);
                    break;
                case "Processos arquivados":
                    (currentScrapedData as apiResponseArquivadosProps[]) = await scrapeArquivados(operationType, { user: username, password }, trtNumber, startPuppeteer, mainWindow, date);
                    break;
                case "Acervo geral":
                    (currentScrapedData as apiResponseAcervoGeralProps[]) = await scrapeAcervoGeral(operationType, { user: username, password }, trtNumber, startPuppeteer, mainWindow, date);
                    break;
                default:
                    console.warn("Tipo de operação desconhecido no loop de scrape:", operationType);
                    continue;
            }
            // @ts-ignore
            allScrapedResults.push(currentScrapedData);
            processedItems++;
            const progress = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;
            mainWindow.webContents.send('progress-percentual', `${progress}`);
        }

        lastScrapedData = allScrapedResults; // Armazena os dados para o save
        lastOperationType = operationType;

        const totalElements = allScrapedResults.reduce((acc, currList) => acc + (currList ? currList.length : 0), 0);
        mainWindow.webContents.send('processos-encontrados', Number(totalElements));
        mainWindow.webContents.send('progress-messages', { message: `Busca finalizada! ${totalElements} processos encontrados.` });
        mainWindow.webContents.send('process-finished', { success: true, message: "Processamento do Excel e buscas concluídos." });

    } catch (error: any) {
        saveErrorLog(error, `Erro em MainBostExcelService (${operationType})`);
        mainWindow.webContents.send('invalid-excel-format', `Erro ao processar a planilha: ${error.message}`);
        mainWindow.webContents.send('process-finished', { success: false, error: error.message });
        throw error; // Re-lança para o handler IPC pegar se necessário
    } finally {
        mainWindow.webContents.send('is-loading', false);
    }
}

export async function MainBostService(mainWindow: BrowserWindow, scrapeData: ScrapeData) {
    mainWindow.webContents.send('is-loading', true);
    mainWindow.webContents.send('progress-messages', { message: `Iniciando busca manual para ${scrapeData.painel}...` });
    try {
        let processedData;
        const { painel, trt, date, username, password } = scrapeData;
        const credentials = { user: username, password }
        // @ts-ignore
        const trtNumber = trtDict[trt];

        switch (painel) {
            case "Minha pauta":
                processedData = await scrapeMinhaPauta(painel, date, credentials, trtNumber, startPuppeteer, mainWindow);
                break;
            case "Processos arquivados":
                processedData = await scrapeArquivados(painel, credentials, trtNumber, startPuppeteer, mainWindow, date);
                break;
            case "Acervo geral":
                processedData = await scrapeAcervoGeral(painel, credentials, trtNumber, startPuppeteer, mainWindow, date);
                break;
            default:
                throw new Error(`Tipo de painel desconhecido: ${painel}`);
        }

        lastScrapedData = [processedData]; // Armazena para o save
        lastOperationType = painel;

        const totalElements = processedData ? processedData.length : 0;
        mainWindow.webContents.send('processos-encontrados', Number(totalElements));
        mainWindow.webContents.send('progress-messages', { message: `Busca manual finalizada! ${totalElements} processos encontrados.` });
        mainWindow.webContents.send('process-finished', { success: true, message: "Busca manual concluída." });

    } catch (error: any) {
        saveErrorLog(error, `Erro em MainBostService (${scrapeData.painel})`);
        mainWindow.webContents.send('process-finished', { success: false, error: error.message });
        throw error;
    } finally {
        mainWindow.webContents.send('is-loading', false);
    }
}

// Função para lidar com o salvamento, chamada por um handler IPC separado
export async function handleSaveExcel(mainWindow: BrowserWindow): Promise<{ success: boolean, message?: string, error?: string }> {
    if (!lastScrapedData || !lastOperationType) {
        const msg = "Nenhum dado raspado encontrado para salvar.";
        console.warn(msg);
        return { success: false, error: msg };
    }

    try {
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, { // Use filePath em vez de filePaths
            title: 'Salvar Relatório TRT',
            defaultPath: `BoTRT_Relatorio_${lastOperationType.replace(/\s/g, '_')}_${format(new Date(), 'dd-MM-yyyy-HH-mm-ss')}.xlsx`,
            filters: [{ name: 'Planilhas Excel', extensions: ['xlsx'] }]
        });

        if (canceled || !filePath) {
            console.log("Salvamento cancelado pelo usuário.");
            return { success: false, message: "Salvamento cancelado." };
        }

        mainWindow.webContents.send('progress-messages', { message: `Salvando arquivo em: ${filePath}` });
        // Assumindo que writeMassiveDataToSingleFile é sua função refatorada que cria UMA pasta de trabalho
        // com múltiplas abas se lastScrapedData for [][]excelDataIdentified
        // ou uma única aba se lastScrapedData for []excelDataIdentified.
        // Você precisará ajustar a chamada a writeMassiveDataToSingleFile
        // ou ter uma função diferente se lastScrapedData de MainBostService for diferente de MainBostExcelService.

        // Se lastScrapedData é sempre [][]excelDataIdentified:
        await writeMassiveData(lastScrapedData as excelDataIdentified[][], filePath);

        mainWindow.webContents.send('progress-messages', { message: `Arquivo salvo com sucesso!` });
        lastScrapedData = null; // Limpa os dados após salvar
        lastOperationType = null;
        return { success: true, message: "Arquivo salvo com sucesso!" };

    } catch (error: any) {
        saveErrorLog(error, "Erro ao salvar o arquivo Excel.");
        mainWindow.webContents.send('progress-messages', { message: `Erro ao salvar: ${error.message}` });
        return { success: false, error: error.message };
    }
}




// Função auxiliar para adicionar dados a uma worksheet
// (Você pode precisar de diferentes funções auxiliares se as colunas variarem muito entre painéis)
function addDataToWorksheet(worksheet: exceljs.Worksheet, data: excelDataIdentified, painel: ScrapeData["painel"]) {
    let columns: Partial<exceljs.Column>[] = [];
    const { excelData, identifier } = data
    // Definindo os cabeçalhos das colunas com base no painel
    if (painel === "Minha pauta") {
        columns = [
            { header: 'Usuário', key: 'usuario', width: 15 },
            { header: 'TRT', key: 'trt', width: 15 },
            { header: 'Grau', key: 'grau', width: 15 },
            { header: 'Número do Processo', key: 'numeroProcesso', width: 25 },
            { header: 'Tipo de Audiência', key: 'tipoAudiencia', width: 30 },
            { header: 'Órgão Julgador', key: 'orgaoJulgador', width: 50 },
            { header: 'Data Inicio', key: 'dataInicio', width: 24 },
            { header: 'Hora Inicio', key: 'horaInicio', width: 24 },
            { header: 'Polo Ativo', key: 'poloAtivo', width: 50 },
            { header: 'Polo Passivo', key: 'poloPassivo', width: 50 },
            { header: 'Url Audiencia Virtual', key: 'urlAudienciaVirtual', width: 50 }
        ];
        worksheet.columns = columns;


        (excelData as AudienciaSimplificada[]).forEach((item: AudienciaSimplificada) => { // Tipagem específica
            worksheet.addRow({
                usuario: item.usuario,
                trt: identifier.trt,
                grau: identifier.grau,
                numeroProcesso: item.numeroProcesso,
                tipoAudiencia: item.tipoAudiencia,
                orgaoJulgador: item.orgaoJulgador,
                excelDataInicio: moment(item.dataInicio).format('DD/MM/YYYY'),
                horaInicio: moment(item.dataInicio).format('HH:mm'),
                poloAtivo: item.poloAtivo,
                poloPassivo: item.poloPassivo,
                urlAudienciaVirtual: item.urlAudienciaVirtual
            });
        });
    } else if (painel === "Processos arquivados") {
        columns = [
            { header: 'Usuário', key: 'usuario', width: 15 },
            { header: 'Número do Processo', key: 'numeroProcesso', width: 25 },
            { header: 'Parte Autora', key: 'nomeParteAutora', width: 25 },
            { header: 'Parte Reclamante', key: 'nomeParteRe', width: 30 }, // Presumo que seja 'nomeParteReclamada' ou similar
            { header: 'Data Arquivamento', key: 'dataArquivamento', width: 50 }
        ];
        worksheet.columns = columns;
        (excelData as ProcessosArquivadosSimplificado[]).forEach((item: ProcessosArquivadosSimplificado) => { // Tipagem específica
            worksheet.addRow({
                usuario: item.usuario,
                trt: identifier.trt,
                grau: identifier.grau,
                numeroProcesso: item.numeroProcesso,
                nomeParteAutora: item.nomeParteAutora,
                nomeParteRe: item.nomeParteRe, // Ajuste a chave se necessário
                dataArquivamento: moment(item.dataArquivamento).format('DD/MM/YYYY')
            });
        });
    } else if (painel === "Acervo geral") {
        columns = [
            { header: 'Usuário', key: 'usuario', width: 15 },
            { header: 'Número do Processo', key: 'numeroProcesso', width: 25 },
            { header: 'Órgão julgador', key: 'descricaoOrgaoJulgador', width: 25 },
            { header: 'Parte Autora', key: 'nomeParteAutora', width: 25 },
            { header: 'Parte Reclamante', key: 'nomeParteRe', width: 30 }, // Ajuste
            { header: 'Data Autuação', key: 'dataAutuacao', width: 50 }
        ];
        worksheet.columns = columns;
        (excelData as AcervoGeralSimplificado[]).forEach((item: AcervoGeralSimplificado) => { // Tipagem específica
            worksheet.addRow({
                usuario: item.usuario,
                trt: identifier.trt,
                grau: identifier.grau,
                numeroProcesso: item.numeroProcesso,
                descricaoOrgaoJulgador: item.descricaoOrgaoJulgador,
                nomeParteAutora: item.nomeParteAutora,
                nomeParteRe: item.nomeParteRe, // Ajuste
                dataAutuacao: moment(item.dataAutuacao).format('DD/MM/YYYY')
            });
        });
    }
    // Adicione um estilo básico ao cabeçalho
    if (worksheet.getRow(1)) {
        worksheet.getRow(1).font = { bold: true };
    }
}


export async function writeMassiveData(
    listOfAllExcelData: excelDataIdentified[][], // Mantém a estrutura original se ela faz sentido
    filePath, // Caminho COMPLETO do arquivo, incluindo nome.xlsx
) {
    const workbook = new exceljs.Workbook();
    let hasData = false;

    // Iterar sobre a lista de "grupos de TRT" (primeiro nível do array)
    for (const scrapeList of listOfAllExcelData) {
        // Iterar sobre cada resultado de scrape dentro do grupo
        for (const scrapeData of scrapeList) {
            // Verifica se há dados e um número de processo válido no primeiro item
            if (!scrapeData.excelData || scrapeData.excelData.length === 0 || !scrapeData.excelData[0].numeroProcesso) {
                console.warn(`Dados vazios ou inválidos para ${scrapeData.identifier.trt}_${scrapeData.identifier.grau}. Pulando.`);
                continue;
            }

            hasData = true;
            const painelType = scrapeData.excelData[0].type; // Pega o tipo do painel do primeiro item

            // Nome da planilha: TRT_Grau-Painel (garantir que seja curto e sem caracteres inválidos)
            let sheetName = `${scrapeData.identifier.trt}_${scrapeData.identifier.grau}_${painelType.replace(/[\s/]+/g, '_')}`;
            // Trunca o nome da planilha para o limite do Excel (31 caracteres) e remove caracteres inválidos
            sheetName = sheetName.replace(/[\\/*?:[\]]/g, "").substring(0, 30);

            // Evitar nomes de planilha duplicados (pode acontecer se um TRT/Grau tiver múltiplos scrapes do mesmo painel)
            let originalSheetName = sheetName;
            let counter = 1;
            while (workbook.getWorksheet(sheetName)) {
                sheetName = `${originalSheetName.substring(0, 28 - String(counter).length)}(${counter})`; // Deixa espaço para (N)
                counter++;
            }

            const worksheet = workbook.addWorksheet(sheetName);
            console.log(`Criando aba: ${sheetName} para painel: ${painelType}`);

            // Adiciona os dados à planilha recém-criada
            // A função addDataToWorksheet precisará saber qual tipo de painel é
            // para definir as colunas corretas.
            addDataToWorksheet(worksheet, scrapeData, painelType as ScrapeData["painel"]);
        }
    }

    if (!hasData) {
        console.log("Nenhum dado válido encontrado em listOfAllExcelData para gerar o arquivo Excel.");
        return; // Não cria o arquivo se não houver dados
    }

    // Salvando o arquivo Excel UMA VEZ, após todas as planilhas serem adicionadas
    try {
        const finalFileName = `${filePath}`;
        // Se filePath já é o nome completo do arquivo:
        console.log(`Salvando workbook em: ${filePath}`);
        await workbook.xlsx.writeFile(finalFileName);
        console.log(`Arquivo Excel consolidado salvo com sucesso em: ${filePath}`);
    } catch (error) {
        console.error('Erro ao salvar o arquivo Excel consolidado:', error);
        throw error; // Re-lança o erro para ser tratado pelo chamador
    }
}
