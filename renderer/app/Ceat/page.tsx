'use client';

import { useEffect, useState } from 'react';
import {
    Flex,
    Heading,
    Text,
    VStack,
    Input,
    Button,
    Fieldset,
    Field,
    Box,
    Code,
    List,
    ListItem
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { Toaster, toaster } from '../components/ui/toaster';

// ✨ NOVO: Interface para o resultado da extração ✨
interface CeatResult {
    cnpj_consultado: string;
    vara_do_trabalho: string;
    numero_processo: string;
    tipo_processo: string;
}

export default function CeatPage() {
    const [cnpj, setCnpj] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // ✨ NOVOS ESTADOS: Para guardar os resultados e os logs ✨
    const [results, setResults] = useState<CeatResult[] | null>(null);
    const [logMessages, setLogMessages] = useState<string[]>([]);

    // ✨ NOVO: Efeito para ouvir os logs de progresso do backend ✨
    useEffect(() => {
        const unsubscribe = window.ipc.progressMessagesDetails((payload) => {
            setLogMessages((prevLogs) => [...prevLogs, payload.message]);
        });
        return () => unsubscribe();
    }, []);

    // ✨ ATUALIZAÇÃO: A função agora é async para usar await ✨
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!cnpj.trim()) {
            toaster.create({ /* ... (toast de erro) */ });
            return;
        }

        console.log(`[Frontend] Enviando CNPJ para o main process: ${cnpj}`);
        setIsLoading(true);
        setResults(null); // Limpa os resultados anteriores
        setLogMessages([]); // Limpa os logs anteriores

        // ✨ ATUALIZAÇÃO: Chamada com await para esperar a resposta do backend ✨
        const response = await window.ipc.scrapeCeat(cnpj);

        setIsLoading(false); // Para o spinner após a conclusão

        if (response.success) {
            toaster.create({
                title: "Extração Concluída!",
                type: "success",
            });
            setResults((response.data ?? null) as CeatResult[] | null); // Guarda os dados no estado (garante tipo e lida com undefined)
        } else {
            toaster.create({
                title: "Erro na Extração",
                description: response.error,
                type: "error",
                duration: 9000
            });
        }
    };

    const MotionFlex = motion(Flex);

    return (
        <MotionFlex w='100%'>
            <Toaster />
            <VStack w="100%" maxW="5xl" gap={10}> {/* Aumentei o maxW */}
                {/* Seção do Formulário */}
                <VStack w="100%" maxW="xl" gap={8}>
                    {/* ... (código do Heading e Text) */}
                    <Heading as="h1" size="xl">Extração de Processos (CEAT)</Heading>
                    <Text color="gray.400">Insira o CNPJ para buscar a Certidão e extrair os processos associados.</Text>

                    <form onSubmit={handleSubmit}>
                        <Fieldset.Root as="form" w="100%" disabled={isLoading}>
                            {/* ... (código do Fieldset.Content e Input) */}
                            <Field.Root required>
                                <Field.Label>CNPJ da Parte</Field.Label>
                                <Input
                                    id="cnpj"
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    size="lg"
                                />
                                <Field.HelperText>O robô irá aceder ao portal do TRT-15.</Field.HelperText>
                            </Field.Root>
                            <Button
                                type="submit"
                                colorPalette="white"
                                size="lg"
                                w="100%"
                                mt={8}
                                loading={isLoading}
                                loadingText="Extraindo..."
                            >
                                Iniciar Extração
                            </Button>
                        </Fieldset.Root>
                    </form>
                </VStack>

                {/* ✨ NOVA SEÇÃO: Painel de Logs e Resultados ✨ */}
                {(isLoading || results) && (
                    <VStack
                        w="100%"
                        p={6}
                        bg="whiteAlpha.50"
                        borderRadius="md"
                        align="start"
                        gap={4}
                    >
                        <Heading size="md">Acompanhamento</Heading>
                        {/* Exibe os logs durante o processo */}
                        {isLoading && (
                            <Box w="100%" maxH="200px" overflowY="auto" p={3} bg="blackAlpha.300" borderRadius="sm">
                                <List.Root>
                                    {logMessages.map((msg, index) => (
                                        <List.Item key={index} fontSize="sm">{msg}</List.Item>
                                    ))}
                                </List.Root>
                            </Box>
                        )}
                        {/* Exibe o resultado final */}
                        {results && (
                            <Box w="100%" maxH="400px" overflowY="auto" p={3}>
                                <Heading size="sm" mb={4}>{results.length} Processo(s) Encontrado(s):</Heading>
                                <Code w="100%" p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
                                    {JSON.stringify(results, null, 2)}
                                </Code>
                            </Box>
                        )}
                    </VStack>
                )}
            </VStack>
        </MotionFlex>
    );
}
