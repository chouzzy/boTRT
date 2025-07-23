// Salve como, por exemplo, src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { Flex, Text, Link, VStack, Heading, Image, Button } from '@chakra-ui/react';
import NextLink from 'next/link'; // Para navegação Next.js
import { useColorModeValue } from '../ui/color-mode';
import { NavItem, sideBar } from 'renderer/data/textData';
import { TransitionLink } from '../ui/TransitionLink';
import { useLoading } from 'renderer/contexts/LoadingContext';


export function SideMenu() {
    const { mainNavItems, supportNavItems } = sideBar
    const [activeItem, setActiveItem] = useState(mainNavItems[0].label); // Estado para controlar o item ativo
    const { startLoading } = useLoading();

    // Cores do tema (assumindo que você tem um fundo escuro)
    const bgColor = useColorModeValue('gray.800', 'gray.900'); // Fundo escuro
    const logoColor = useColorModeValue('white', 'white');
    const copyrightColor = useColorModeValue('gray.600', 'gray.600');

    return (
        <Flex
            as="nav"
            draggable
            direction="column" // Organiza os elementos verticalmente
            width={{ base: 'full', md: 'sm' }} // Largura responsiva
            height="100vh" // Ocupa a altura total da tela
            bg={'bodyBg'}
            px={8} // Padding geral
            py={12} // Padding geral
            top={0}
            left={0}
            zIndex="sticky" // Para ficar sobre o conteúdo
            alignItems={'center'}
            justifyContent={'center'}
            style={{ borderRadius: '40px 0 0 40px' }}
        >
            {/* Seção do Logo */}
            <Flex mb={10} w='100%' alignItems="center" justifyContent="center">
                <Image src={'images/logo.svg'} alt='logo' boxSize={24} />
            </Flex>

            {/* Seção Principal de Navegação */}
            <Flex w='100%' gap={2} align="stretch" flex={1} direction="column" textTransform={'uppercase'} >
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.label}
                        item={item}
                        isActive={activeItem === item.label}
                        onClick={() => {
                            setActiveItem(item.label)
                            startLoading()
                        }}
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
                        onClick={() => {
                            setActiveItem(item.label)
                            startLoading()
                        }}
                    />
                ))}
            </VStack>
            <Flex py={2}>
                <Button onClick={() => window.ipc.logout()} bgColor={'transparent'} border={'1px solid white'} color={'white'} _hover={{ bgColor: 'brand.600', borderColor:'transparent' }} size='xs' px={12}>
                    Sair
                </Button>
            </Flex>

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
        <TransitionLink href={item.href}>
            <Flex
                onClick={onClick}

                display="flex"
                alignItems="center"
                w='100%'
                py={3}
                px={4}
                bgColor={isActive ? 'whiteAlpha.200' : 'transparent'} // Fundo transparente para manter o efeito hover
                position="relative" // Para o pseudo-elemento ::before
                color={isActive ? activeColor : defaultColor}
                fontWeight={isActive ? 'bold' : 'semibold'}
                transition="color 0.2s ease-in-out"
                _hover={{
                    color: hoverColor,
                    textDecoration: 'none',
                    bgColor: 'whiteAlpha.200'

                }}
                // Pseudo-elemento para a barrinha lateral vermelha do item ativo
                _before={{
                    content: '""',
                    position: 'absolute',
                    left: 1,
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
                <Flex alignItems={'center'} gap={4} w='100%' justifyContent='start'>
                    {item.icon}
                    <Text>{item.label}</Text>

                </Flex>
            </Flex>
        </TransitionLink>
    );
}
