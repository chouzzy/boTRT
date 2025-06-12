// Salve como, por exemplo, src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { Flex, Text, Link, VStack, Heading } from '@chakra-ui/react';
import NextLink from 'next/link'; // Para navegação Next.js
import { useColorModeValue } from '../ui/color-mode';
import { NavItem, sideBar } from 'renderer/data/textData';


export function SideMenu() {
    const { mainNavItems, supportNavItems } = sideBar
    const [activeItem, setActiveItem] = useState(mainNavItems[0].label); // Estado para controlar o item ativo

    // Cores do tema (assumindo que você tem um fundo escuro)
    const bgColor = useColorModeValue('gray.800', 'gray.900'); // Fundo escuro
    const logoColor = useColorModeValue('white', 'white');
    const copyrightColor = useColorModeValue('gray.600', 'gray.600');

    return (
        <Flex
            as="nav"
            draggable
            direction="column" // Organiza os elementos verticalmente
            width={{ base: 'full', md: 'xs' }} // Largura responsiva
            height="100vh" // Ocupa a altura total da tela
            bg={'bodyBg'}
            px={6} // Padding geral
            py={12} // Padding geral
            top={0}
            left={0}
            zIndex="sticky" // Para ficar sobre o conteúdo
            alignItems={'center'}
            justifyContent={'center'}
        >
            {/* Seção do Logo */}
            <Flex mb={10} w='100%' alignItems="center" justifyContent="center">
                <Heading as="h1" size="3xl" color={logoColor} fontWeight={'bold'} letterSpacing={1.5}>
                    <Text as="span">Bo</Text>
                    <Text as="span" color="#FF5F5E">TRT</Text>
                </Heading>
            </Flex>

            {/* Seção Principal de Navegação */}
            <Flex w='100%' gap={2} align="stretch" flex={1} direction="column" textTransform={'uppercase'}>
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.label}
                        item={item}
                        isActive={activeItem === item.label}
                        onClick={() => setActiveItem(item.label)}
                    />
                ))}
            </Flex>

            {/* Seção Inferior (Suporte e Copyright) */}
            <VStack gap={2} align="stretch" mb={4} textTransform={'uppercase'}>
                {supportNavItems.map((item) => (
                    <NavLink
                        key={item.label}
                        item={item}
                        isActive={activeItem === item.label}
                        onClick={() => setActiveItem(item.label)}
                    />
                ))}
            </VStack>

            <Flex>
                <Text fontSize="xs" color={copyrightColor}>
                    ©2025 AWER LLC.
                </Text>
            </Flex>
        </Flex>
    );
}






// Componente para um item de navegação individual
interface NavLinkProps {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
    const activeColor = '#FF5F5E'; // Sua cor de destaque
    const defaultColor = useColorModeValue('gray.400', 'gray.500');
    const hoverColor = useColorModeValue('white', 'white');

    return (
        <NextLink href={item.href} passHref legacyBehavior>
            <Link
                onClick={onClick}
                display="flex"
                alignItems="center"
                w='100%'
                py={3}
                px={8}
                position="relative" // Para o pseudo-elemento ::before
                color={isActive ? activeColor : defaultColor}
                fontWeight={isActive ? 'bold' : 'medium'}
                transition="color 0.2s ease-in-out"
                _hover={{
                    color: hoverColor,
                    textDecoration: 'none',
                }}
                // Pseudo-elemento para a barrinha lateral vermelha do item ativo
                _before={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: isActive ? 'translateY(-50%) scaleY(1)' : 'translateY(-50%) scaleY(0)',
                    transformOrigin: 'center',
                    height: '70%', // Altura da barrinha
                    width: '4px', // Largura da barrinha
                    bg: activeColor,
                    borderRadius: 'full',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <Text>{item.label}</Text>
            </Link>
        </NextLink>
    );
}
