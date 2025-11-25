'use client';

import React, { useState, useEffect } from 'react';
import { 
    Flex, VStack, Heading, Input, Button, Text, Box, 
    List, ListItem, Fieldset, Stack, Alert
} from '@chakra-ui/react';
import { PiQrCode } from "react-icons/pi";
import { toaster } from '../components/ui/toaster';

export default function SetupMFA() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [secretKey, setSecretKey] = useState(''); // Para mostrar ao usuário no final

    // Ouve os logs do backend em tempo real
    useEffect(() => {
        const unsubscribe = window.ipc.progressMessagesDetails((payload: { message: string }) => {
            setLogs(prev => [...prev, payload.message]);
        });
        return () => unsubscribe();
    }, []);

    const handleSetup = async () => {
        if (!user || !password) {
            toaster.create({ title: "Campos obrigatórios", description: "Preencha usuário e senha.", type: "warning" });
            return;
        }

        setIsLoading(true);
        setLogs(['Iniciando configuração automática...']);
        setSecretKey('');

        try {
            // Chama o serviço de cadastro no backend
            const result = await window.ipc.setupMfaAuto({ user, pass: password });

            if (result.success) {
                toaster.create({ title: "Configurado!", description: "MFA cadastrado e salvo com sucesso!", type: "success" });
                setLogs(prev => [...prev, "✅ SUCESSO: Chave capturada e salva!"]);
                setSecretKey(result.secretKey); // Exibe a chave para o usuário salvar no celular
            } else {
                toaster.create({ title: "Falha", description: result.error, type: "error" });
                setLogs(prev => [...prev, `❌ FALHA: ${result.error}`]);
            }
        } catch (error: any) {
            console.error(error);
            setLogs(prev => [...prev, `❌ ERRO CRÍTICO: ${error.message}`]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex direction="column" w="100%" h="100vh" align="center" justify="center" bg="cardBg" p={8}>
            <Stack direction={{ base: 'column', md: 'row' }} w="100%" maxW="6xl" gap={8}>
                
                {/* Formulário */}
                <VStack flex={1} bg="whiteAlpha.100" p={8} borderRadius="lg" gap={6} align="stretch">
                    <Heading size="lg">Configurar MFA do Robô</Heading>
                    <Text color="gray.400" fontSize="sm">
                        Esta ferramenta acessa o PJe, lê o QR Code da tela e configura o robô automaticamente.
                    </Text>

                    <Alert.Root status="info" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Atenção:</Alert.Title>
                            <Alert.Description>
                                Ao fazer isso, o seu aplicativo atual (Google Auth) será desconectado. 
                                Você receberá a nova chave no final para cadastrar novamente no seu celular.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert.Root>

                    <Fieldset.Root>
                        <VStack gap={4}>
                            <Input placeholder="CPF / Usuário PJe" value={user} onChange={e => setUser(e.target.value)} />
                            <Input placeholder="Senha PJe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </VStack>
                    </Fieldset.Root>

                    <Button 
                        colorScheme="blue" 
                        size="lg" 
                        onClick={handleSetup} 
                        loading={isLoading}
                        loadingText="Configurando..."
                    >
                        <PiQrCode style={{ marginRight: '8px' }} />
                        Configurar Automaticamente
                    </Button>

                    {/* Exibe a chave no final para o usuário */}
                    {secretKey && (
                        <Box p={4} bg="green.900" borderRadius="md" border="1px solid" borderColor="green.500">
                            <Text fontWeight="bold" color="green.300" mb={2}>MFA Configurado! Adicione esta chave ao seu celular:</Text>
                            <Text fontFamily="monospace" fontSize="lg" color="white" userSelect="all">{secretKey}</Text>
                        </Box>
                    )}
                </VStack>

                {/* Terminal de Logs */}
                <VStack flex={1} bg="blackAlpha.800" p={6} borderRadius="lg" align="stretch" h="500px">
                    <Heading size="sm" color="gray.300" mb={4}>Status da Operação</Heading>
                    <Box flex={1} overflowY="auto" fontFamily="monospace" fontSize="sm">
                        <List.Root gap={2}>
                            {logs.map((msg, i) => (
                                <ListItem key={i} color={msg.includes('❌') ? 'red.300' : msg.includes('✅') ? 'green.300' : 'gray.300'}>
                                    {msg.includes('[MFA-SETUP]') ? msg.replace('[MFA-SETUP]', '') : `> ${msg}`}
                                </ListItem>
                            ))}
                        </List.Root>
                    </Box>
                </VStack>
            </Stack>
        </Flex>
    );
}