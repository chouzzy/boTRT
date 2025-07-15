// src/contexts/LoadingContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Interface para o nosso contexto
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Este é o provedor que gerencia o estado de loading de toda a aplicação.
 * Ele é autossuficiente e controla o início e o fim do loading
 * ouvindo as mudanças de rota e usando um sistema de "passaporte" para
 * evitar bugs de cliques múltiplos.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // --- Nossas Ferramentas Anti-Bug ---
  
  // 1. O timer que agenda a aparição do loading.
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 2. O "passaporte" de cada navegação. Só a última tentativa tem validade.
  const navigationAttemptRef = useRef(0);

  // Função para iniciar a verificação de loading (chamada pelos links)
  const startLoading = useCallback(() => {
    // Incrementa o passaporte. Cada clique gera um novo número.
    const currentAttemptId = ++navigationAttemptRef.current;

    // Limpa qualquer timer antigo para garantir que só a última ação vale.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Agenda a verificação para daqui a 600ms.
    timerRef.current = setTimeout(() => {
      // QUANDO O TIMER DISPARAR, ele verifica se o passaporte ainda é válido.
      // Se o usuário já clicou em outro link, o 'navigationAttemptRef.current' terá mudado,
      // e esta condição será falsa, impedindo o loading de aparecer incorretamente.
      if (navigationAttemptRef.current === currentAttemptId) {
        console.log("Navegação lenta detectada. Exibindo tela de loading...");
        setIsLoading(true);
      }
    }, 600); // Delay para não poluir a tela em navegações rápidas
  }, []);

  // Função interna para parar e resetar tudo.
  const stopLoadingAndReset = useCallback(() => {
    // Invalida o passaporte de qualquer navegação que estava em andamento.
    navigationAttemptRef.current += 1; 

    // Limpa o timer, caso ele ainda não tenha disparado.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Garante que a tela de loading seja desligada.
    setIsLoading(false);
  }, []);

  // O OBSERVADOR DE NAVEGAÇÕES BEM-SUCEDIDAS
  // Este useEffect roda toda vez que a URL (pathname) muda, ou seja,
  // toda vez que uma navegação é CONCLUÍDA com sucesso.
  useEffect(() => {
    console.log(`Navegação concluída para: ${pathname}. Resetando o loading.`);
    stopLoadingAndReset();
  }, [pathname, stopLoadingAndReset]);


  const value = { isLoading, startLoading };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Hook customizado para usar o contexto facilmente
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
