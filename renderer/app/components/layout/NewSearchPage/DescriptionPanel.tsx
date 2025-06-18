import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { PiBulldozerFill, PiCircleNotch } from "react-icons/pi";
import { CustomText } from "../../ui/CustomText";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

// 4. Componente para o Painel de Descrição (lado direito)
interface DescriptionPanelProps {
    description: string;
    logMessages: string[];
}
export function DescriptionPanel({ description, logMessages }: DescriptionPanelProps) {
    return (
        <Flex flexDir={'column'} gap={4} ml={8} h='100%' w='100%' justifyContent={'center'} alignItems={'center'}>
             <LogDisplay logs={logMessages} />
            <CustomText text={description} fontWeight={'light'} fontSize={'xl'} textAlign="center" />
            <PiBulldozerFill size={64} color={'#FF5F5E'} />
        </Flex>
    );
}


interface LogDisplayProps {
    logs: string[];
}

export function LogDisplay({ logs }: LogDisplayProps) {
    const MotionBox = motion(Flex);
    const logVariants: Variants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    // Ref para o container dos logs para fazer o auto-scroll
    const logsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll para a última mensagem quando novos logs chegarem
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Flex
            flexDir={'column'}
            gap={4}
            ml={8}
            h='100%'
            w='100%'
            maxW={720}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <CustomText text="Progresso da Operação" fontWeight={'semibold'} fontSize={'xl'} />
            <VStack
                ref={logsContainerRef}
                w="full"
                h="250px" // Altura fixa para a caixa de log
                bg="blackAlpha.300"
                borderRadius="md"
                p={4}
                align="flex-start"
                overflowY="auto" // Scroll se os logs excederem a altura
                gap={2}
            >
                <AnimatePresence>
                    {logs.map((log, index) => (
                        <MotionBox
                            key={`${log}-${index}`} // Key mais estável
                            variants={logVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            display="flex"
                            alignItems="center"
                            width="100%"
                        >
                            <Icon as={PiCircleNotch} color="green.300" mr={2} className="animate-spin" />
                            <Text fontSize="sm" fontFamily="mono">{log}</Text>
                        </MotionBox>
                    ))}
                </AnimatePresence>
            </VStack>
        </Flex>
    );
}