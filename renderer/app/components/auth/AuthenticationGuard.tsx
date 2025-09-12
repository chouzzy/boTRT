// src/components/auth/AuthenticationGuard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flex, Spinner, Heading, Text, Button, VStack, Icon, HStack, Image } from '@chakra-ui/react';
import { PiSignIn, PiWarningCircleFill, PiSmileyXEyesLight } from 'react-icons/pi';

// ============================================================================
//   SUB-COMPONENTE: Tela de Login
// ============================================================================
function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = () => {
        setIsLoading(true);
        window.ipc.startLogin();
    };
    return (
        <Flex w="100vw" h="100vh" justify="center" align="center" bg="blue.950" color="white" borderRadius={40}>
            <VStack gap={8}>
                <Image src="/images/logo.svg" alt="Logo" boxSize="100px" mx='auto' />
                <Heading>Bem-vindo ao Bo<span style={{ color: '#FF5F5E' }}>TRT</span></Heading>
                <Text>Por favor, faça o login para continuar.</Text>
                <Button colorScheme="blue" size="lg" onClick={handleLogin} loading={isLoading} bgColor={'brand.600'} color={'white'} _hover={{ bgColor: 'brand.700' }} width="100%">
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
//   SUB-COMPONENTE: Tela de Licença Inválida (COM POLLING E CONTADOR)
// ============================================================================
interface InvalidLicenseScreenProps {
    onRecheckLicense: () => void;
    isRechecking: boolean;
}

function InvalidLicenseScreen({ onRecheckLicense, isRechecking }: InvalidLicenseScreenProps) {
    
    const [countdown, setCountdown] = useState(10);

    // Efeito para verificação automática (Polling)
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!isRechecking) {
                onRecheckLicense();
            }
        }, 10000); // 10 segundos
        return () => clearInterval(intervalId);
    }, [onRecheckLicense, isRechecking]);

    // Efeito para o contador visual
    useEffect(() => {
        if (isRechecking) {
            setCountdown(10);
        }
        const countdownInterval = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 10));
        }, 1000); // 1 segundo
        return () => clearInterval(countdownInterval);
    }, [isRechecking]);

    return (
        <Flex w="100vw" h="100vh" justify="center" align="center" bg="blue.950" color="white" p={4} borderRadius={40}>
            <VStack gap={6} p={10} bg="gray.700" borderRadius="lg" boxShadow="lg" position="relative">
            <Icon as={PiSmileyXEyesLight} boxSize={16} color="brand.500" />
            <Heading size="lg">Assinatura Não Encontrada</Heading>
            <Text textAlign="center" maxW="md">
                Se você acabou de assinar, aguarde um momento enquanto validamos seu plano. O aplicativo verificará novamente em alguns segundos.
            </Text>
            <HStack gap={4} w="100%" justify="center" pt={4}>
                <Button
                variant="outline"
                bgColor={'brand.500'}
                _hover={{ bgColor: 'brand.600' }}
                onClick={() => {
                    window.ipc.openExternal('https://www.awer.co/tecnologia/botrt');
                }}
                >
                Ver Planos
                </Button>
                <Button
                variant="outline"
                bgColor={'blue.600'}
                onClick={() => {
                    window.ipc.logout();
                }}
                >
                Sair
                </Button>
            </HStack>
            
            <Flex
                position="absolute"
                bottom={4}
                right={4}
                align="center"
                gap={2}
                color="gray.400"
                fontSize="xs"
            >
                <Spinner size="xs" opacity={isRechecking ? 1 : 0} />
                <Text>
                {isRechecking ? 'Verificando...' : `Próxima verificação em ${countdown}s`}
                </Text>
            </Flex>
=======
                <Icon as={PiSmileyXEyesLight} boxSize={16} color="brand.500" />
                <Heading size="lg">Assinatura Não Encontrada</Heading>
                <Text textAlign="center" maxW="md">
                    Se você acabou de assinar, aguarde um momento enquanto validamos seu plano. O aplicativo verificará novamente em alguns segundos.
                </Text>
                <HStack gap={4} w="100%" justify="center" pt={4}>
                    <Button
                        variant="outline"
                        bgColor={'brand.500'}
                        _hover={{ bgColor: 'brand.600' }}
                        onClick={() => {
                            window.ipc.openExternal('https://www.awer.co/tecnologia/botrt');
                        }}
                    >
                        Ver Planos
                    </Button>
                </HStack>
                
                <Flex
                    position="absolute"
                    bottom={4}
                    right={4}
                    align="center"
                    gap={2}
                    color="gray.400"
                    fontSize="xs"
                >
                    <Spinner size="xs" opacity={isRechecking ? 1 : 0} />
                    <Text>
                        {isRechecking ? 'Verificando...' : `Próxima verificação em ${countdown}s`}
                    </Text>
                </Flex>
            </VStack>
        </Flex>
    );
}

// ============================================================================
//   COMPONENTE PRINCIPAL: AuthenticationGuard
// ============================================================================
export function AuthenticationGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLicenseValid, setIsLicenseValid] = useState(false);
    const [isLicenseCheckLoading, setIsLicenseCheckLoading] = useState(true);
    const [isRechecking, setIsRechecking] = useState(false);

    // Efeito que verifica o estado de autenticação UMA VEZ ao carregar o app
    useEffect(() => {
        const checkAuthStatus = async () => {
            const authenticated = await window.ipc.isAuthenticated();
            setIsAuthenticated(authenticated);
            setIsAuthLoading(false);
        };
        checkAuthStatus();
    }, []);

    // A lógica de verificação agora está em um useCallback para ser reutilizável
    const checkLicense = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const token = await window.ipc.getAccessToken();
                if (!token) throw new Error("Token de acesso não disponível.");
                
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await fetch(`${apiBaseUrl}/api/subscription/details`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const responsejson = await response.json();
                
                if (response.ok) {
                    console.log("[GUARD] Licença verificada:", responsejson);
                    if (responsejson.status === 'active') {
                        setIsLicenseValid(true);
                    } else {
                        setIsLicenseValid(false);
                    }
                } else {
                    setIsLicenseValid(false);
                }
            } catch (error) {
                console.error("[GUARD] Erro ao verificar a licença:", error);
                setIsLicenseValid(false);
            }
        }
    }, [isAuthenticated]);

    // Efeito que executa a verificação da licença na primeira carga
    useEffect(() => {
        const runInitialCheck = async () => {
            if (!isAuthLoading) {
                await checkLicense();
                setIsLicenseCheckLoading(false);
            }
        };
        runInitialCheck();
    }, [isAuthenticated, isAuthLoading, checkLicense]);

    // Função para o polling de verificação
    const handleRecheckLicense = async () => {
        if (isRechecking) return;
        setIsRechecking(true);
        await checkLicense();
        setIsRechecking(false);
    };

    // --- Renderização Condicional ---
    if (isAuthLoading || isLicenseCheckLoading) {
        return <Flex w="100vw" h="100vh" justify="center" align="center" bg="blue.950"><Spinner size="xl" color="blue.500" /></Flex>;
    }
    if (isAuthenticated && isLicenseValid) {
        return <>{children}</>;
    }
    if (isAuthenticated && !isLicenseValid) {
        return <InvalidLicenseScreen onRecheckLicense={handleRecheckLicense} isRechecking={isRechecking} />;
    }
    return <LoginScreen />;
}
