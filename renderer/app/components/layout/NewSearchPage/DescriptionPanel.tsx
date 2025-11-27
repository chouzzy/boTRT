'use client';

import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

// Importei os ícones necessários, incluindo o de "check"
import { PiCircleNotch, PiCheckCircleFill } from "react-icons/pi";

import { CustomText } from "../../ui/CustomText";

// ============================================================================
//   Componente do Painel de Descrição (Lado Direito)
// ============================================================================
interface DescriptionPanelProps {
    description: string;
    logMessages: string[];
    isProcessFinished: boolean;
    isProcessStarted: boolean;
}

export function DescriptionPanel({ description, logMessages, isProcessFinished, isProcessStarted }: DescriptionPanelProps) {
    return (
        <Flex
            flexDir={'column'}
            gap={4}
            ml={{ base: 0, md: 8 }}
            maxW={500}
            h='100%'
            w='100%'
            justifyContent={'center'}
            alignItems={'center'}
        >
            {/* Mostra os logs enquanto o processo está rodando */}
            <LogDisplay logs={logMessages} />
            {/* {isProcessStarted && !isProcessFinished && (
            )} */}
            
            {/* Mostra a descrição final quando o processo termina */}
            {/* {isProcessFinished && (
                <CustomText text={description} fontWeight={'light'} fontSize={'xl'} textAlign="center" />
            )} */}
        </Flex>
    );
}


// ============================================================================
//   Componente de Exibição de Logs
// ============================================================================
interface LogDisplayProps {
    logs: string[];
}

export function LogDisplay({ logs }: LogDisplayProps) {
    const MotionBox = motion(Flex);
    
    // Variantes para a animação de entrada de cada linha de log
    const logVariants: Variants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    // Ref para o container dos logs para fazer o auto-scroll
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Efeito para rolar para a última mensagem quando novos logs são adicionados
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Flex
            flexDir={'column'}
            gap={4}
            h='100%'
            w='100%'
            maxW={720}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <CustomText text="Progresso da Operação" fontWeight={'semibold'} fontSize={'xl'} />
            
            {/* Container dos logs com scroll */}
            <VStack
                ref={logsContainerRef}
                w="full"
                h={'100%'}
                bg="blackAlpha.300"
                borderRadius="md"
                p={4}
                align="flex-start"
                overflowY="auto"
                gap={2}
            >
                <AnimatePresence>
                    {logs.map((log, index) => {
                        // Verifica se este é o último log da lista
                        const isLast = index === logs.length - 1;
                        if (!log) return null; // Ignora logs vazios

                        return (
                            <MotionBox
                                key={`${log}-${index}`}
                                // variants={logVariants}
                                // initial="initial"
                                // animate="animate"
                                exit="exit"
                                display="flex"
                                alignItems="center"
                                width="100%"
                            >
                                {/* Lógica de Ícone Condicional */}
                                {isLast && (log != 'Arquivo salvo com sucesso!') && (!log.startsWith('Busca finalizada!')) && (!log.startsWith('⚠️⚠️⚠️ Nenhum processo encontrado')) ? (
                                    // Se for o último log, mostra o spinner
                                    <Icon as={PiCircleNotch} color="green.300" mr={2} className="animate-spin" />
                                ) : (
                                    // Se for um log já concluído, mostra o ícone de check
                                    <Icon as={PiCheckCircleFill} color="green.400" mr={2} />
                                )}
                                
                                <Text fontSize="sm" fontFamily="mono">{log}</Text>
                            </MotionBox>
                        );
                    })}
                </AnimatePresence>
            </VStack>
        </Flex>
    );
}
