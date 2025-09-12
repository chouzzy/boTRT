'use client';

import React from 'react';
import { Flex, Link, Stack } from '@chakra-ui/react'; // Importei o Stack
import NextLink from 'next/link';
import { motion, Variants } from 'framer-motion';

import { homePage } from 'renderer/data/textData';

import { Button } from '@chakra-ui/react';
import { CustomText } from '../../ui/CustomText';
// Removi o 'i' não utilizado de framer-motion

export function WelcomeSection() {
    const { description, subtitle, title, manual, news, callToAction } = homePage;

    const MotionButton = motion(Button); // Sintaxe simplificada
    const MotionFlex = motion(Flex);

    const HomeVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.66 } },
    };

    // As variantes dos botões não precisam de alteração
    const buttonVariants: Variants = {
        initial: {
            color: '#FFFFFF',
        },
        hover: {
            backgroundColor: '#FF5F5E',
            transition: { duration: 0.1, ease: 'easeInOut' }
        },
        tap: {
            scale: 0.80,
        }
    };

    const ctaVariants: Variants = {
        initial: {
            backgroundColor: '#FF5F5E',
            color: '#FFFFFF',
        },
        hover: {
            backgroundColor: '#F0EFF4',
            color: '#FF5F5E',
            transition: { duration: 0.1, ease: 'easeInOut' }
        },
        tap: {
            backgroundColor: '#FF5F5E',
            transition: { duration: 0.05, ease: 'easeInOut' }
        }
    };

    return (
        <Flex
            flexDir={'column'}
            w='100%'
            minH={{base: '100vh', md: '100vh'}} // AJUSTE: minH é mais seguro que h para evitar cortes de conteúdo
            bg={'transparent'}
            // AJUSTE: Padding responsivo. Menor em telas pequenas, maior em telas grandes.
            px={{ base: 12, md: 8, lg: 12 }}
            pt={{ base: 12, md: 0 }}
            justifyContent={{base: 'start', md: 'center'}}
            alignItems={'center'} // AJUSTE: Centralizado horizontalmente para melhor visualização
        >
            <MotionFlex
                variants={HomeVariants}
                initial='initial'
                animate='visible'
                flexDir={'column'}
                w='100%' // AJUSTE: Ocupa 100% do pai
                maxW='container.lg' // AJUSTE: Limita a largura máxima em telas grandes para legibilidade
                // AJUSTE: Gap responsivo
                gap={{ base: 10, md: 12 }}
                // AJUSTE: Alinha o texto à esquerda em telas maiores, centraliza em pequenas
                alignItems={{ base: 'center', md: 'start' }}
                textAlign={{ base: 'start', md: 'left' }}
            >
                <Flex flexDir={'column'} gap={8}>
                    <Flex flexDir={'column'} lineHeight={1.1} gap={{ base: 4, md: 6 }}>
                        <CustomText
                            text={title}
                            // AJUSTE: Fonte responsiva
                            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                            fontWeight={'semibold'}
                            textTransform={'uppercase'}
                            pl={1}
                        />
                        <CustomText
                            text={subtitle}
                            fontWeight={'700'}
                            // AJUSTE CRÍTICO: Fonte gigante agora é responsiva
                            fontSize={{ base: 'xl', sm: '8xl', md: '8xl', lg: '9xl' }}
                            letterSpacing={0.1}
                        />
                    </Flex>

                    <Flex flexDir={'column'}>
                        <CustomText
                            text={description}
                            fontWeight={'light'}
                            // AJUSTE: Fonte responsiva
                            fontSize={{ base: 'md', lg: 'lg' }}
                            maxW={{ base: '90%', md: '100%' }} // Evita que o texto encoste nas bordas
                        />
                    </Flex>

                    {/* AJUSTE: Usei Stack para agrupar os botões e controlar a direção */}
                    <Stack
                        direction={{ base: 'column', lg: 'column' }}
                        gap={{ base: 4, md: 6 }}
                        align={{ base: 'stretch', md: 'start' }} // 'stretch' faz os botões terem a mesma largura na vertical
                        mt={4}
                    >
                        {/* Botão Manual */}
                        <Link as={NextLink} href={manual.link} _hover={{ textDecoration: 'none' }} >
                            <MotionButton
                                variants={buttonVariants}
                                initial='initial'
                                whileHover='hover'
                                whileTap="tap"
                                bgColor={'transparent'}
                                border='2px solid'
                                color={'ghostWhite'}
                                borderColor={'ghostWhite'}
                                // AJUSTE: Padding responsivo
                                px={{ base: 6, md: 12, lg: 24 }}
                                py={{ base: 2, md: 2 }} // Altura consistente
                                textTransform={'uppercase'}
                                w="100%" // Garante que o botão se estique no modo coluna
                            >
                                {manual.title}
                            </MotionButton>
                        </Link>

                        {/* Botão CTA */}
                        <Link as={NextLink} href={callToAction.link} _hover={{ textDecoration: 'none' }} >
                            <MotionButton
                                variants={ctaVariants}
                                initial='initial'
                                whileHover='hover'
                                whileTap="tap"
                                bgColor={'brand.600'}
                                color={'ghostWhite'}
                                textTransform={'uppercase'}
                                // AJUSTE: Tamanho do botão e fonte responsivos
                                size={{ base: 'lg', md: '2xl' }}
                                fontSize={{ base: 'lg', md: '2xl', lg: '3xl' }}
                                px={{ base: 32, md: 32, lg: 32 }}
                                py={{ base: 6, md: 8 }}
                                gap={4}
                                w="100%"
                            >
                                {callToAction.buttonText}
                            </MotionButton>
                        </Link>
                    </Stack>
                </Flex>

                <Flex flexDir={'column'} gap={2} >
                    <CustomText
                        text={news.title}
                        fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                        fontWeight={'semibold'}
                        textTransform={'uppercase'}
                    />
                    <CustomText
                        text={news.description}
                        fontWeight={'light'}
                        fontSize={{ base: 'xs', md: 'sm' }}
                    />
                </Flex>
            </MotionFlex>
        </Flex>
    );
}
