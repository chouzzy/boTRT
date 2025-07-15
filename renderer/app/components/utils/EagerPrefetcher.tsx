// src/components/utils/EagerPrefetcher.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ===================================================================
//   CONFIGURE AQUI AS SUAS ROTAS PRINCIPAIS
//   Adicione todas as páginas que o usuário provavelmente visitará.
// ===================================================================
const routesToPrefetch = [
    '/',                // A página Home
    '/NewSearch',       // A página de Nova Busca
    '/SearchHistory',   // A página de Histórico
    '/ContactPage',     // Página de Contato
    '/LicensePage',     // Página de Licença
    '/ScheduleSearch',  // Página de Busca Agendada
    '/SettingsPage',    // Página de Configurações
    '/SupportPage',     // Página de Suporte
];

/**
 * Este componente, quando montado, pré-carrega as rotas principais da aplicação
 * para garantir uma navegação quase instantânea. Ele não renderiza nenhuma UI.
 */
export function EagerPrefetcher() {
    const router = useRouter();

    useEffect(() => {
        console.log('[EagerPrefetcher] Iniciando pré-carregamento de rotas principais...');
        
        routesToPrefetch.forEach(route => {
            try {
                // A função prefetch do Next.js baixa os assets da rota em segundo plano.
                router.prefetch(route);
                console.log(`- Rota '${route}' marcada para pré-carregamento.`);
            } catch (error) {
                // Adicionamos um try...catch para o caso de uma rota ser inválida,
                // evitando que a aplicação quebre.
                console.warn(`[EagerPrefetcher] Falha ao pré-carregar a rota '${route}':`, error);
            }
        });
        
    // O array de dependências vazio [] garante que este efeito rode apenas UMA VEZ,
    // quando a aplicação é montada pela primeira vez.
    }, []); // Deixar o array vazio é intencional para rodar apenas no mount.

    // Este componente é puramente lógico, não precisa renderizar nada.
    return null;
}
