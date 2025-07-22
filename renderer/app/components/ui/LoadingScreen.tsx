// Salve como, por exemplo, src/app/components/ui/LoadingScreen.tsx
'use client';

import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from 'renderer/contexts/LoadingContext';

export function LoadingScreen() {
    const { isLoading } = useLoading();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    style={{
                        borderRadius: '40px',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999, // Para ficar sobre todo o conteúdo
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Flex
                        borderRadius={40}
                        align="center"
                        justify="center"
                        width="full"
                        height="full"
                        bg="rgba(10, 25, 47, 0.8)" // Cor de fundo semi-transparente (seu blue.950)
                        backdropFilter="blur(5px)" // Efeito de desfoque no fundo
                    >
                        <VStack gap={4}>
                            <Spinner
                                boxSize="40px"
                                color="brand.500" // Sua cor de destaque
                                size="xl"
                            />
                            <Text color="ghostWhite" fontSize="lg">Carregando...</Text>
                        </VStack>
                    </Flex>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
