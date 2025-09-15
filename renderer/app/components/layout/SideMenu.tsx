'use client';

import React, { useState } from 'react';
import { Flex, Text, VStack, Image, Button, HStack } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { NavItem, sideBar } from 'renderer/data/textData';
import { TransitionLink } from '../ui/TransitionLink';
import { useLoading } from 'renderer/contexts/LoadingContext';

export function SideMenu() {
    const { mainNavItems, supportNavItems } = sideBar;
    const [activeItem, setActiveItem] = useState(mainNavItems[0].label);
    const { startLoading } = useLoading();

    const copyrightColor = useColorModeValue('gray.600', 'gray.600');

    const handleLogout = () => {
        window.ipc.logout();
    };

    return (
        <Flex
            as="nav"
            // AJUSTE: Direção, Posição e Dimensões Responsivas
            direction={{ base: 'row', md: 'column' }}
            w={{ base: 'full', md: 'sm' }}
            h={{ base: 'auto', md: '100vh' }}
            bg={'bodyBg'}
            borderLeftRadius={{ base: 0, md: 40 }}
            // AJUSTE: Padding responsivo
            px={{ base: 4, md: 4 }}
            py={{ base: 2, md: 12 }}
            // AJUSTE: Posicionamento fixo na base para mobile, fixo na lateral para desktop
            position={{ base: 'fixed', md: 'static' }}
            top={{ base: 'auto', md: 0 }}
            bottom={{ base: 0, md: 'auto' }}
            left={0}
            right={{ base: 0, md: 'auto' }} // Garante que ocupe toda a largura no mobile
            zIndex="sticky"
            justifyContent={{ base: 'space-around', md: 'center' }}
            alignItems={'center'}
            // AJUSTE: Bordas arredondadas apenas para a versão desktop (lateral)
            // borderRadius={{ base: 0, md: '0 20px 20px 0' }}
        >
            {/* Seção do Logo - Visível apenas em Desktop */}
            <Flex
                mb={{ base: 0, md: 10 }}
                w={{ base: 'auto', md: '100%' }}
                alignItems="center"
                justifyContent="center"
                // AJUSTE: Esconde o logo em telas pequenas
                display={{ base: 'none', md: 'flex' }}
            >
                <Image src={'/images/logo.svg'} alt='logo' boxSize={24} />
            </Flex>

            {/* AJUSTE: Usar HStack para navegação principal em mobile */}
            <Flex
                w='100%'
                gap={{ base: 4, md: 3 }}
                align="stretch"
                flex={{ base: '1', md: '1' }}
                direction={{ base: 'row', md: 'column' }}
                justifyContent={{ base: 'start', md: 'flex-start' }}
                textTransform={'uppercase'}
            >
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

            {/* Seção Inferior (Suporte e Copyright) - Visível apenas em Desktop */}
            <VStack
                gap={2}
                align="stretch"
                mb={4}
                textTransform={'uppercase'}
                // AJUSTE: Esconde a seção de suporte em telas pequenas
                display={{ base: 'none', md: 'flex' }}
            >
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

            {/* Botão de Sair - Visível apenas em Desktop */}
            <Flex py={2} display={{ base: 'none', md: 'flex' }}>
                <Button onClick={handleLogout} bgColor={'transparent'} border={'1px solid white'} color={'white'} _hover={{ bgColor: 'brand.600', borderColor: 'transparent' }} size='xs' px={12}>
                    Sair
                </Button>
            </Flex>

            {/* Copyright - Visível apenas em Desktop */}
            <Flex display={{ base: 'none', md: 'flex' }}>
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
    const activeColor = '#FF5F5E';
    const defaultColor = useColorModeValue('gray.400', 'gray.500');
    const hoverColor = useColorModeValue('white', 'white');

    return (
        <TransitionLink href={item.href} >
            <Flex
                onClick={onClick}
                alignItems="center"
                justifyContent={{ base: 'center', md: 'start' }} // Centraliza o conteúdo (ícone e texto)
                textAlign={'center'}
                w='100%'
                // AJUSTE: Layout responsivo para o NavLink
                direction={{ base: 'column', md: 'row' }}
                py={{ base: 2, md: 3 }}
                px={{ base: 2, md: 4 }}
                gap={{ base: 1, md: 4 }}
                bgColor={isActive ? 'whiteAlpha.200' : 'transparent'}
                position="relative"
                color={isActive ? activeColor : defaultColor}
                fontWeight={isActive ? 'bold' : 'semibold'}
                transition="all 0.2s ease-in-out"
                borderRadius="md"
                _hover={{
                    color: hoverColor,
                    textDecoration: 'none',
                    bgColor: 'whiteAlpha.200'
                }}
                // AJUSTE: Pseudo-elemento responsivo
                _before={{
                    content: '""',
                    position: 'absolute',
                    // Posição da barrinha: topo para mobile, esquerda para desktop
                    left: { base: '50%', md: 1 },
                    top: { base: 0, md: '50%' },
                    // Transformação para centralizar corretamente em ambas as orientações
                    transform: isActive
                        ? { base: 'translateX(-50%) scaleX(1)', md: 'translateY(-50%) scaleY(1)' }
                        : { base: 'translateX(-50%) scaleX(0)', md: 'translateY(-50%) scaleY(0)' },
                    transformOrigin: 'center',
                    // Dimensões da barrinha: horizontal para mobile, vertical para desktop
                    height: { base: '3px', md: '70%' },
                    width: { base: '50%', md: '4px' },
                    bg: activeColor,
                    borderRadius: 'full',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                {item.icon}
                {/* AJUSTE: Texto visível apenas em telas maiores */}
                <Text fontSize={{ base: '2xs', md: 'md' }} display={{ base: 'block', md: 'block' }}>
                    {item.label}
                </Text>
            </Flex>
        </TransitionLink>
    );
}
