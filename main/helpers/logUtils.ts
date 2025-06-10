// Salve como app/helpers/logUtils.ts
import * as fs from 'fs';
import * as path from 'path';
import os from 'os'; // Módulo 'os' do Node.js para obter o diretório home

/**
 * Salva uma mensagem de erro detalhada em um arquivo de log na área de trabalho do usuário.
 * @param error O objeto de erro capturado.
 * @param customMessage Uma mensagem personalizada para adicionar ao início do log (opcional).
 */
export function saveErrorLog(error: Error, customMessage?: string): void {
    try {
        const desktopDir = path.join(os.homedir(), 'Desktop');
        const now = new Date();

        // Formata a data e hora para o nome do arquivo
        // Ex: 05-06-2025-17-45-30
        const datePart = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const timePart = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
        const timestamp = `${datePart}-${timePart}`;

        const filename = `BoTRT-Erro-${timestamp}.log.txt`; // Adiciona .log antes de .txt para clareza
        const logFilePath = path.join(desktopDir, filename);

        // Monta o conteúdo do log
        const logContent = `
--------------------------------------------------
Log de Erro do BoTRT
Data e Hora: ${now.toISOString()}
--------------------------------------------------

${customMessage ? `Contexto do Erro:\n${customMessage}\n\n` : ''}
Mensagem de Erro:
${error.message}

Stack Trace:
${error.stack || 'Nenhum stack trace disponível.'}

--------------------------------------------------
`;

        // Escreve o arquivo de forma assíncrona
        fs.writeFile(logFilePath, logContent.trim(), (err) => {
            if (err) {
                console.error('Falha CRÍTICA ao tentar escrever no arquivo de log de erro:', err);
            } else {
                console.log(`Log de erro detalhado salvo em: ${logFilePath}`);
            }
        });
    } catch (e: any) {
        // Captura erros que podem ocorrer ao tentar obter o diretório ou formatar a data,
        // embora seja menos provável aqui.
        console.error('Erro inesperado na função saveErrorLog:', e);
    }
}
