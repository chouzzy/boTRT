// src/components/auth/AuthenticationGuard.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Flex, Spinner, Heading, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { PiSignIn, PiWarningCircleFill } from 'react-icons/pi';

// ============================================================================
//   SUB-COMPONENTE: Tela de Login
// ============================================================================
function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        // Apenas envia o sinal para o processo main iniciar todo o fluxo.
        window.ipc.startLogin();
    };

    return (
        <Flex w="100vw" h="100vh" justify="center" align="center" bg="gray.800" color="white">
            <VStack gap={8}>
                <Heading>Bem-vindo ao BoTRT</Heading>
                <Text>Por favor, faça o login para continuar.</Text>
                <Button colorScheme="blue" size="lg" onClick={handleLogin} loading={isLoading}>
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
                    Por favor, visite nosso site para adquirir um plano ou entre em contato com o suporte.
                </Text>
                <Button
                    colorScheme="blue"
                    onClick={() => {
                        window.ipc.openExternal('https://www.awer.co/tecnologia/botrt');
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
    // ESTADOS LOCAIS: Agora nós controlamos o estado, não mais o useAuth0.
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLicenseValid, setIsLicenseValid] = useState(false);
    const [isLicenseCheckLoading, setIsLicenseCheckLoading] = useState(true);

    // Efeito que verifica o estado de autenticação UMA VEZ ao carregar o app
    useEffect(() => {
        const checkAuthStatus = async () => {
            console.log("[GUARD] Verificando status de autenticação inicial...");
            // Pergunta ao processo main se já existe uma sessão válida
            const authenticated = await window.ipc.isAuthenticated();
            console.log("[GUARD] Resposta do main:", authenticated);
            setIsAuthenticated(authenticated);
            setIsAuthLoading(false);
        };
        checkAuthStatus();
    }, []);

    // Efeito que verifica a licença APENAS se estiver autenticado
    useEffect(() => {
        const checkLicense = async () => {
            if (isAuthenticated) {
                console.log("[GUARD] Usuário autenticado. Verificando licença...");
                try {
                    // Pede o token de acesso para o processo main
                    const token = await window.ipc.getAccessToken();
                    if (!token) {
                        throw new Error("Token de acesso não disponível.");
                    }

                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                    const response = await fetch(`${apiBaseUrl}/api/subscription/details`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'active') {
                            console.log("[GUARD] Licença VÁLIDA encontrada!");
                            setIsLicenseValid(true);
                        } else {
                            console.log("[GUARD] Licença encontrada, mas com status:", data.status);
                        }
                    } else {
                        console.log("[GUARD] Resposta de verificação de licença não foi OK.");
                        setIsLicenseValid(false);
                    }
                } catch (error) {
                    console.error("[GUARD] Erro ao verificar a licença:", error);
                    setIsLicenseValid(false);
                } finally {
                    setIsLicenseCheckLoading(false);
                }
            } else {
                // Se não está autenticado, não há licença para verificar
                setIsLicenseCheckLoading(false);
            }
        };
        
        // Só roda a verificação de licença depois que a verificação de auth terminar
        if (!isAuthLoading) {
            checkLicense();
        }
    }, [isAuthenticated, isAuthLoading]);

    // --- Renderização Condicional ---
    if (isAuthLoading || isLicenseCheckLoading) {
        return <Flex w="100vw" h="100vh" justify="center" align="center" bg="gray.800"><Spinner size="xl" color="blue.500" /></Flex>;
    }
    if (isAuthenticated && isLicenseValid) {
        return <>{children}</>;
    }
    if (isAuthenticated && !isLicenseValid) {
        return <InvalidLicenseScreen />;
    }
    return <LoginScreen />;
}
