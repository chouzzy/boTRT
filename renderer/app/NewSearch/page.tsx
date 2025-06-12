// Salve como, por exemplo, src/components/sections/WelcomeSection.tsx
'use client';

import React, { useState } from 'react';
import { Box, Button, Fieldset, FileUpload, Flex, Link, Portal, Select, Text } from '@chakra-ui/react';
import { CustomText } from '../components/ui/CustomText';
import { newSearch, operations } from 'renderer/data/textData';
import { motion, Variants } from 'framer-motion';
import { PiBulldozerFill, PiDownloadSimpleFill, PiMicrosoftExcelLogoFill, PiPlayFill } from 'react-icons/pi';
import { Controller, useForm } from "react-hook-form"
import { Toaster, toaster } from '../components/ui/toaster';

interface FormData {
    operacao: painelProps;
    planilha: File | null;
}

export default function NewSearch() {

    const {
        handleSubmit,
        formState: { errors },
        register,
        control,
    } = useForm<FormData>({
        defaultValues: { // Valores iniciais do seu formulário
            operacao: "Minha pauta", // Valor padrão para o campo de operação
            planilha: null, // Inicialmente, não há arquivo selecionado
        }
    }
    )



    const { inputDescription, input, title, downloadButton, downloadLink, select } = newSearch

    const MotionButton = motion.create(Button);
    const MotionFlex = motion.create(Flex);

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
            transition: { duration: 0.1, ease: 'easeInOut' } // Transição suave
        },
        tap: { // Estado ao clicar/pressionar
            scale: 0.80, // Diminui 5%
        }
    };



    const onSubmit = handleSubmit(async ({ operacao, planilha }: FormData) => {
        console.log('oi')
        if (!planilha) {
            errors.operacao = { type: 'manual', message: 'É necessário fazer o upload de uma planilha.' };
            return
        }
        await window.ipc.sendExcelPath({ excelPath: planilha?.path, operationType: operacao })

    })

    return (
        <Flex flexDir={'column'} w='100%' h='100vh' bg={'transparent'} justifyContent={'center'} alignItems='center'>


            <MotionFlex variants={HomeVariants} initial='initial' bgColor={'cardBg'} animate='visible' flexDir={'column'} w='breakpoint-xl' gap={12} p={16}>

                <Flex gap={8}>
                    <Flex>
                        <form onSubmit={onSubmit}>
                            <Fieldset.Root size="lg" invalid>
                                <Fieldset.Legend w='100%' mb={16}>
                                    <CustomText text={title} textAlign='center' fontSize={'5xl'} fontWeight={'semibold'} textTransform={'uppercase'} pl={1} />
                                </Fieldset.Legend>

                                <Fieldset.Content>
                                    {/* Envolve o Select.Root com o Controller */}
                                    <Controller
                                        name="operacao" // Nome do campo para o react-hook-form
                                        control={control} // Passa o objeto 'control' do useForm
                                        rules={{ required: 'É necessário selecionar uma operação.' }} // Adiciona regra de validação
                                        render={({ field, fieldState }) => (
                                            <Select.Root
                                                collection={operations}
                                                width="320px"
                                                // O valor do Select agora vem do 'field.value' do Controller.
                                                // O Select do Chakra v3 pode esperar um array.
                                                value={field.value ? [field.value] : []}
                                                // O onValueChange agora chama field.onChange para atualizar o estado do react-hook-form.
                                                // O 'e.value' do Select.Root geralmente é um array. Pegamos o primeiro item.
                                                onValueChange={(e) => field.onChange(e.value[0])}
                                                required
                                            >
                                                <Select.HiddenSelect />
                                                <Select.Label>
                                                    <CustomText text={select} fontWeight={'light'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' />
                                                </Select.Label>
                                                <Select.Control>
                                                    <Select.Trigger>
                                                        {/* O ValueText exibe o valor. Removemos o register daqui. */}
                                                        <Select.ValueText
                                                            placeholder="Selecione"
                                                            fontWeight={'medium'}
                                                            fontSize={'sm'}
                                                            textTransform={'uppercase'}
                                                        />
                                                    </Select.Trigger>
                                                    <Select.IndicatorGroup>
                                                        <Select.Indicator />
                                                    </Select.IndicatorGroup>
                                                </Select.Control>
                                                <Portal>
                                                    <Select.Positioner>
                                                        <Select.Content>
                                                            {operations.items.map((framework) => (
                                                                <Select.Item item={framework} key={framework.value}>
                                                                    <CustomText text={framework.title} fontWeight={'medium'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' letterSpacing={1.3} />
                                                                    <Select.ItemIndicator />
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                            </Select.Root>
                                        )}
                                    />


                                    <FileUpload.Root maxW="sm" alignItems="stretch" maxFiles={1} gap={8}>
                                        <Fieldset.Legend>
                                            <CustomText text={input} fontWeight={'light'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' />
                                        </Fieldset.Legend>
                                        <Fieldset.Legend>
                                            <MotionButton variants={buttonVariants} initial='initial' whileHover='hover' whileTap="tap" bgColor={'transparent'} border='2px solid' color={'ghostWhite'} borderColor={'ghostWhite'} px={24} textTransform={'uppercase'}>
                                                <Link href={downloadLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <Flex gap={2} alignItems={'center'}>
                                                        <PiDownloadSimpleFill />
                                                        <CustomText text={downloadButton} />
                                                    </Flex>
                                                </Link>
                                            </MotionButton>
                                        </Fieldset.Legend>
                                        <FileUpload.HiddenInput {...register("planilha")} />
                                        <FileUpload.Dropzone>
                                            <Flex gap={4}>
                                                <Flex color="#217346" bgColor={'ghostWhite'} borderRadius={'lg'} p={1}>
                                                    <PiMicrosoftExcelLogoFill size={42} />
                                                </Flex>
                                            </Flex>
                                            <FileUpload.DropzoneContent>
                                                <Box>{inputDescription}</Box>
                                                <Box color="fg.muted">Faça o download da planilha modelo se necessário</Box>
                                            </FileUpload.DropzoneContent>
                                        </FileUpload.Dropzone>
                                        <FileUpload.List />
                                    </FileUpload.Root>
                                </Fieldset.Content>
                                <Fieldset.ErrorText>
                                    {/* Mostra erro de validação do react-hook-form, se houver */}
                                    {errors.operacao && <Text color="red.500" fontSize="sm" mt={1}>{errors.operacao.message}</Text>}

                                </Fieldset.ErrorText>
                                <Button
                                    type="submit"
                                    bgColor={'brand.500'}
                                    border='1px solid #FFFFFF55'
                                    color={'ghostWhite'}
                                    py={8}
                                    fontSize={'2xl'}
                                    gap={4}
                                    _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: ' 0.6s ease-in-out' }}
                                >
                                    <PiPlayFill size={24} />
                                    INICIAR
                                </Button>
                            </Fieldset.Root>
                        </form>
                    </Flex>

                    <Flex borderLeft={'1px solid'} borderColor={'whiteAlpha.300'} h='100%' />

                    <Flex flexDir={'column'} gap={4} ml={8} h='100%' w='100%' justifyContent={'center'} alignItems={'center'}>
                        <CustomText text={newSearch.description} fontWeight={'light'} fontSize={'xl'} />
                        <PiBulldozerFill size={64} color={'#FF5F5E'} />
                    </Flex>
                </Flex>
            </MotionFlex>

        </Flex>
    );
}
