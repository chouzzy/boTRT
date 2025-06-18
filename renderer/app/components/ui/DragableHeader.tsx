// Salve como, por exemplo, src/app/components/layout/DraggableHeader.tsx
'use client';

import { Flex, HStack, IconButton, Text, Box } from '@chakra-ui/react';
// Ícones que você já tinha no seu layout.tsx
import { AiOutlineClose, AiOutlineMinus } from 'react-icons/ai';
// Ícone para maximizar/restaurar, da mesma família
import { VscChromeMaximize } from 'react-icons/vsc';
import { useColorModeValue } from './color-mode';

export function DraggableHeader() {
    // Funções que chamam a API que você expôs no preload.js
    const handleMinimize = () => window.ipc.window.minimize();
    const handleMaximize = () => window.ipc.window.maximize();
    const handleClose = () => window.ipc.window.close();

    // Cores para os botões que se adaptam ao tema
    const iconColor = useColorModeValue('gray.600', 'gray.300');
    const iconHoverBg = useColorModeValue('gray.200', 'gray.700');
    const closeHoverBg = useColorModeValue('red.500', 'red.600');
    const closeHoverColor = 'white';

    return (
            <Flex
                as="header"
                width="100%"
                justifyContent="space-between" // Empurra título para a esquerda e botões para a direita
                alignItems="center"
                height="40px" // Altura da sua barra de título customizada
                px={2}
            // bg="transparent" // O fundo virá do layout pai
            // --- CSS ESSENCIAL PARA ÁREA ARRASTÁVEL ---
            >
                {/* Lado Esquerdo: Título ou Logo */}
                <Box ml={2}>
                    <Text fontWeight="bold">BoTRT</Text>
                </Box>

                {/* Lado Direito: Botões de Controle da Janela */}
                <HStack gap={1}>
                    <IconButton
                        aria-label="Minimizar Janela"
                        size="sm"
                        variant="ghost"
                        color={iconColor}
                        onClick={handleMinimize}
                        // --- CSS ESSENCIAL PARA TORNAR O BOTÃO CLICÁVEL ---
                        _hover={{ bg: iconHoverBg }}
                    >
                        <AiOutlineMinus />
                    </IconButton>
                    <IconButton
                        aria-label="Maximizar ou Restaurar Janela"
                        size="sm"
                        variant="ghost"
                        color={iconColor}
                        onClick={handleMaximize}
                        _hover={{ bg: iconHoverBg }}
                    >
                        <VscChromeMaximize />
                    </IconButton>
                    <IconButton
                        aria-label="Fechar Janela"
                        size="sm"
                        variant="ghost"
                        color={iconColor}
                        onClick={handleClose}
                        _hover={{ bg: closeHoverBg, color: closeHoverColor }}
                    >
                        <AiOutlineClose />
                    </IconButton>
                </HStack>
            </Flex>
    );
}
