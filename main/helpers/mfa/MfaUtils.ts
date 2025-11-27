import { URL } from 'url';

/**
 * Analisa o input da planilha (que pode ser uma Chave Secreta pura, com espaços, ou uma URL otpauth://)
 * e retorna apenas a Chave Secreta limpa para uso no gerador de código.
 */
export function extractMfaSecret(input: string): string {
    if (!input) return '';

    // Remove espaços do início e fim
    const cleanInput = input.trim();

    // CENÁRIO 1: O usuário colou a URL completa (Apple, 1Password, Google Auth Export)
    // Ex: otpauth://totp?secret=GA4E...&algorithm=SHA1...
    if (cleanInput.toLowerCase().startsWith('otpauth://')) {
        try {
            const parsedUrl = new URL(cleanInput);
            const secret = parsedUrl.searchParams.get('secret');
            
            if (!secret) {
                // Tenta um fallback manual via Regex caso o URL parser falhe ou a URL esteja mal formatada
                const match = cleanInput.match(/secret=([^&]*)/i);
                if (match && match[1]) {
                    return match[1].replace(/\s/g, '').toUpperCase();
                }
                console.warn('URL otpauth detectada, mas parâmetro "secret" não encontrado.');
                return '';
            }

            // Retorna a chave limpa (sem espaços e em maiúsculas)
            return secret.replace(/\s/g, '').toUpperCase();
        } catch (error) {
            console.error('Erro ao processar URL MFA:', error);
            return ''; 
        }
    }

    // CENÁRIO 2: O usuário colou a chave pura (Ex: "GA4E 652T ...")
    // Removemos TODOS os espaços em branco que possam ter vindo no copy-paste e garantimos maiúsculas
    return cleanInput.replace(/\s/g, '').toUpperCase();
}