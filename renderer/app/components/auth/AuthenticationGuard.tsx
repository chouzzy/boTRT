// src/components/auth/AuthenticationGuard.tsx
'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { Flex, Spinner, Heading, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { PiSignIn, PiWarningCircleFill } from 'react-icons/pi';

// ============================================================================
//   SUB-COMPONENTE: Tela de Login
// ============================================================================
function LoginScreen() {
    const { loginWithRedirect } = useAuth0();
    return (
        <Flex w="100vw" h="100vh" justify="center" align="center" bg="gray.800" color="white">
            <VStack gap={8}>
                <Heading>Bem-vindo ao BoTRT</Heading>
                <Text>Por favor, faça o login para continuar.</Text>
                <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => loginWithRedirect()}
                >
                    {/* Ícone e texto como filhos para o padrão Chakra UI v3 */}
                    <Flex align="center" justify="center" gap={2}>
                        <Icon as={PiSignIn} />
                        <Text>Entrar com sua Conta</Text>
                    </Flex>
                </Button>
            </VStack>
        </Flex>
    );
}

// ============================================================================
//   SUB-COMPONENTE: Tela de Licença Inválida
// ============================================================================
function InvalidLicenseScreen() {
    return (
        <Flex w="100vw" h="100vh" justify="center" align="center" bg="gray.800" color="white" p={4}>
            <VStack gap={8} p={10} bg="gray.700" borderRadius="lg" boxShadow="lg">
                <Icon as={PiWarningCircleFill} boxSize={16} color="yellow.400" />
                <Heading size="lg">Assinatura Não Encontrada</Heading>
                <Text textAlign="center" maxW="md">
                    Não encontramos uma assinatura ativa para sua conta.
                    Por favor, visite nosso site para adquirir um plano ou entre em contato com o suporte se acredita que isso é um erro.
                </Text>
                <Button
                    colorScheme="blue"
                    onClick={() => {
                        // TODO: Implementar IPC para abrir o link no navegador
                        // Ex: window.ipc.send('open-external-link', 'https://www.awer.co/tecnologia/botrt');
                        console.log("Abrindo site de planos...");
                    }}
                >
                    Ver Planos
                </Button>
            </VStack>
        </Flex>
    );
}

// ============================================================================
//   COMPONENTE PRINCIPAL: AuthenticationGuard
// ============================================================================
export function AuthenticationGuard({ children }: { children: React.ReactNode }) {
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
        getAccessTokenSilently,
        handleRedirectCallback, // Importado para finalizar o login
    } = useAuth0();

    const [isLicenseValid, setIsLicenseValid] = useState(false);
    const [isLicenseCheckLoading, setIsLicenseCheckLoading] = useState(true);

    // Efeito para ouvir o callback do Auth0 vindo do processo Main
    useEffect(() => {
        const handleAuthCallback = async (url: string) => {
            console.log('[DEBUG] Callback do Auth0 recebido no renderer:', url); // LOG 1
            if (url.includes("code=") && url.includes("state=")) {
                try {
                    console.log('[DEBUG] Processando handleRedirectCallback...'); // LOG 2
                    await handleRedirectCallback(url);
                    console.log('[DEBUG] handleRedirectCallback processado com SUCESSO.'); // LOG 3
                } catch (error) {
                    console.error("[DEBUG] ERRO DENTRO DO handleRedirectCallback:", error); // LOG DE ERRO
                }
            }
        };

        // Registra o ouvinte usando a API 'ipc' que expusemos no preload.js
        const cleanup = window.ipc.onAuth0Callback(handleAuthCallback);

        return cleanup;
    }, [handleRedirectCallback]);


    // Efeito que verifica a licença
    useEffect(() => {
        const checkLicense = async () => {
            // LOG 4: Verifica o estado de autenticação ANTES de buscar a licença
            console.log('[DEBUG] Verificando licença. Estado isAuthenticated:', isAuthenticated);

            if (isAuthenticated) {
                try {
                    const token = await getAccessTokenSilently();
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                    const response = await fetch(`${apiBaseUrl}/api/subscription/details`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'active') {
                            console.log('[DEBUG] Licença VÁLIDA encontrada!'); // LOG 5
                            setIsLicenseValid(true);
                        } else {
                             console.log('[DEBUG] Licença encontrada, mas não está ativa.'); // LOG 6
                        }
                    }
                } catch (error) {
                    console.error("[DEBUG] Erro ao verificar a licença:", error);
                    setIsLicenseValid(false);
                } finally {
                    setIsLicenseCheckLoading(false);
                }
            } else {
                setIsLicenseCheckLoading(false);
            }
        };

        if (!isAuthLoading) {
            checkLicense();
        }
    }, [isAuthenticated, isAuthLoading, getAccessTokenSilently]);

    // --- Renderização Condicional ---

    if (isAuthLoading || isLicenseCheckLoading) {
        return (
            <Flex w="100vw" h="100vh" justify="center" align="center" bg="gray.800">
                <Spinner size="xl" color="blue.500" />
            </Flex>
        );
    }

    if (isAuthenticated && isLicenseValid) {
        return <>{children}</>;
    }

    if (isAuthenticated && !isLicenseValid) {
        return <InvalidLicenseScreen />;
    }

    return <LoginScreen />;
}
