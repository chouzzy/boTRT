'use client';

import React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { motion, Variants } from 'framer-motion';

import { homePage } from 'renderer/data/textData';

import { Button } from '@chakra-ui/react';
import { CustomText } from '../../ui/CustomText';
import { i } from 'framer-motion/client';

export function WelcomeSection() {
    const { description, subtitle, title, manual, news, callToAction } = homePage;

    const MotionButton = motion.create(Button);
    const MotionFlex = motion.create(Flex);

    const HomeVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.66 } },
    };

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
            h='100vh'
            bg={'transparent'}
            px={20}
            py={32}
            justifyContent={'center'}
            alignItems={'start'}
        >
            <MotionFlex
                variants={HomeVariants}
                initial='initial'
                animate='visible'
                flexDir={'column'}
                w='breakpoint-lg'
                gap={20}
            >
                <Flex flexDir={'column'} gap={8}>
                    <Flex flexDir={'column'} lineHeight={1} gap={8}>
                        <CustomText
                            text={title}
                            fontSize={'3xl'}
                            fontWeight={'semibold'}
                            textTransform={'uppercase'}
                            pl={1}
                        />
                        <CustomText text={subtitle} fontWeight={'700'}  fontSize={'9xl'} letterSpacing={0.1} />
                    </Flex>

                    <Flex flexDir={'column'}>
                        <CustomText text={description}  fontWeight={'light'} fontSize={'lg'} />
                    </Flex>

                    <Flex>
                        <MotionButton
                            variants={buttonVariants}
                            initial='initial'
                            whileHover='hover'
                            whileTap="tap"
                            bgColor={'transparent'}
                            border='2px solid'
                            color={'ghostWhite'}
                            borderColor={'ghostWhite'}
                            px={24}
                            textTransform={'uppercase'}
                        >
                            <Link href={manual.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {manual.title}
                            </Link>
                        </MotionButton>
                    </Flex>

                    <Flex>
                        <Link href={callToAction.link} style={{ textDecoration: 'none' }}>
                        <MotionButton
                            variants={ctaVariants}
                            initial='initial'
                            whileHover='hover'
                            whileTap="tap"
                            bgColor={'brand.600'}
                            color={'ghostWhite'}
                            textTransform={'uppercase'}
                            size={'2xl'}
                            justifyContent={'center'}
                            fontSize={'3xl'}
                            px={32}
                            gap={4}
                            style={{ textDecoration: 'none' }}
                        >
                            {callToAction.buttonText}
                        </MotionButton>
                        </Link>
                    </Flex>
                </Flex>

                <Flex flexDir={'column'} gap={2} >
                    <CustomText
                        text={news.title}
                        fontSize={'2xl'}
                        fontWeight={'semibold'}
                        textTransform={'uppercase'}
                        alignItems={'center'}
                    />
                    <CustomText text={news.description} fontWeight={'light'} fontSize={'sm'} />
                </Flex>
            </MotionFlex>
        </Flex>
    );
}
