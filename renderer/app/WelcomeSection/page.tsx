// Salve como, por exemplo, src/components/sections/WelcomeSection.tsx
'use client';

import React from 'react';
import { Button, Flex, Link } from '@chakra-ui/react';
import { CustomText } from '../components/ui/CustomText';
import { homePage } from 'renderer/data/textData';
import { motion, Variants } from 'framer-motion';
import { PiMagnifyingGlass, PiMagnifyingGlassFill, PiPlayFill } from 'react-icons/pi';

export function WelcomeSection() {

    const { description, subtitle, title, manual, news, callToAction } = homePage

    const MotionButton = motion(Button);
    const MotionFlex = motion(Flex);

    const HomeVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.66 } },
    }

    const buttonVariants: Variants = {
        initial: { // Estado normal (sem hover, sem clique)
            color: '#FFFFFF',
        },
        hover: { // Estado no hover
            backgroundColor: '#FF5F5E',
            scale: 1.1, // Aumenta 5%
            transition: { duration: 0.1, ease: 'easeInOut' } // Transição suave
        },
        tap: { // Estado ao clicar/pressionar
            scale: 0.80, // Diminui 5%
        }
    };

    const ctaVariants: Variants = {
        initial: { 
        },
        hover: { // Estado no hover
            scale: 1.1, // Aumenta 10%
            transition: { duration: 0.1, ease: 'easeInOut' } // Transição suave
        },
        tap: { // Estado ao clicar/pressionar
            scale: 0.90, // Diminui 5%
            transition: { duration: 0.05, ease: 'easeInOut' } // Transição suave
        }
    };


    return (
        <Flex flexDir={'column'} w='100%' h='100vh' bg={'transparent'} p={60}>

            <MotionFlex variants={HomeVariants} initial='initial' animate='visible' flexDir={'column'} w='breakpoint-lg' gap={12}>

                <Flex flexDir={'column'} lineHeight={1}>
                    <CustomText text={title} fontSize={'3xl'} fontWeight={'semibold'} textTransform={'uppercase'} pl={1} />
                    <CustomText text={subtitle} fontSize={'9xl'} fontWeight={'semibold'} color={'brand.500'} />
                </Flex>

                <Flex flexDir={'column'}>
                    <CustomText text={description} fontWeight={'light'} fontSize={'xl'} />
                </Flex>

                <Flex>
                    <MotionButton variants={buttonVariants} initial='initial' whileHover='hover' whileTap="tap" bgColor={'transparent'} border='2px solid' color={'ghostWhite'} borderColor={'ghostWhite'} px={24} textTransform={'uppercase'}>
                        <Link href={manual.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {manual.title}
                        </Link>
                    </MotionButton>
                </Flex>

                <Flex>
                    <MotionButton variants={ctaVariants}
                        initial='initial'
                        whileHover='hover'
                        whileTap="tap"
                        bgGradient="to-br"
                        gradientFrom="#FF5F5E"
                        gradientTo="red.700"
                        color={'ghostWhite'}
                        textTransform={'uppercase'}
                        size={'2xl'}
                        justifyContent={'center'}
                        fontSize={'3xl'}
                        px={32}
                        gap={4}
                    >
                        <PiMagnifyingGlassFill size={28} color='white' />
                        {callToAction.buttonText}
                    </MotionButton>
                </Flex>

                <Flex flexDir={'column'} gap={2} >
                    <CustomText text={news.title} fontSize={'2xl'} fontWeight={'semibold'} textTransform={'uppercase'} alignItems={'center'} />
                    <CustomText text={news.description} fontWeight={'light'} fontSize={'sm'} />
                </Flex>

            </MotionFlex>

        </Flex>
    );
}
