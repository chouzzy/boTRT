'use client';

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useForm } from "react-hook-form";

// Chakra UI & Icons
import { Button, Fieldset, Flex, VStack, Stack } from '@chakra-ui/react'; // Adicionado Stack e StackDivider
import { PiFloppyDiskFill, PiPlayFill } from 'react-icons/pi';

// Contexts, Data, e Componentes Customizados
import { newSearch } from 'renderer/data/textData';
import { OperationSelect } from './OperationSelect';
import { SearchTitle } from './SearchTitle';
import { DescriptionPanel } from './DescriptionPanel';
import { ExcelUpload } from './ExcelUpload';
import { toaster } from '../../ui/toaster';

export function NewSearch() {
    const [logMessages, setLogMessages] = useState<string[]>([]);
    const [isProcessFinished, setIsProcessFinished] = useState(false);
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Efeito para ouvir o fim do processo de scrape
    useEffect(() => {
        const unsubscribe = window.ipc.processFinished((payload) => {
            console.log('Renderer: Recebido "process-finished"', payload);
            if (payload.success) {
                setIsProcessFinished(true);
                setIsProcessStarted(false);
                toaster.create({
                    title: 'Busca Concluída!',
                    description: payload.message || "Os dados estão prontos para serem salvos.",
                    type: 'success',
                });
            } else {
                setIsProcessStarted(false); // Garante que o processo pare em caso de erro
                toaster.create({
                    title: 'Erro no Processamento',
                    description: payload.error || "Ocorreu um erro durante a busca.",
                    type: 'error',
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // Efeito para ouvir os logs do backend
    useEffect(() => {
        const unsubscribe = window.ipc.progressMessagesDetails((payload) => {
            console.log("Log Recebido:", payload.message);
            setLogMessages((prevLogs) => [...prevLogs, payload.message]);
        });
        return () => unsubscribe();
    }, []);

    const {
        handleSubmit,
        formState: { errors },
        register,
        control,
        setError,
        reset, // Para limpar o formulário
    } = useForm<FormData>({
        defaultValues: { operacao: "Minha pauta", planilha: null }
    });

    const { inputDescription, input, title, downloadButton, downloadLink, select } = newSearch;
    const MotionFlex = motion(Flex);

    const HomeVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.66 } },
    };

    const readFileAsBuffer = (file: File): Promise<Buffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                if (arrayBuffer) {
                    resolve(Buffer.from(arrayBuffer));
                } else {
                    reject(new Error("Não foi possível ler o arquivo."));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const onSubmit = handleSubmit(async (data) => {
        setLogMessages([]);
        setIsProcessFinished(false);
        setIsProcessStarted(true);
        const { operacao, planilha } = data;

        if (!planilha || planilha.length === 0) {
            setError('planilha', { type: 'manual', message: 'É necessário fazer o upload de uma planilha.' });
            setIsProcessStarted(false);
            return;
        }

        const primeiroArquivo = planilha[0];

        try {
            const fileBuffer = await readFileAsBuffer(primeiroArquivo);
            await window.ipc.processUploadedExcel({
                fileBuffer: fileBuffer,
                fileName: primeiroArquivo.name,
                operationType: operacao
            });
        } catch (error) {
            console.error("Erro ao ler ou processar o arquivo:", error);
            setError('planilha', { type: 'manual', message: 'Ocorreu um erro ao ler o arquivo.' });
            setIsProcessStarted(false);
        }
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await window.ipc.triggerSaveExcelDialog();
            if (result.success) {
                toaster.create({
                    title: 'Sucesso!',
                    description: result.message || 'Arquivo salvo com sucesso.',
                    type: 'success',
                });
                setIsProcessFinished(false);
            } else {
                throw new Error(result.error || "O salvamento foi cancelado ou falhou.");
            }
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            toaster.create({
                title: 'Erro ao Salvar',
                description: error.message,
                type: 'error',
            });
        } finally {
            setIsSaving(false);
            setIsProcessStarted(false);
        }
    };

    return (
        <Flex
            flexDir={'column'}
            w='100%'
            minH='100vh' // AJUSTE: minH é mais seguro
            bg={'transparent'}
            justifyContent={'center'}
            alignItems='center'
            bgColor={'cardBg'}
            // AJUSTE: Padding na página para evitar que o card encoste nas bordas em telas pequenas
        >
            <MotionFlex
                variants={HomeVariants}
                initial='initial'
                bgColor={'cardBg'}
                animate='visible'
                flexDir={'column'}
                // AJUSTE: Largura corrigida e responsiva
                w='100%'
                maxW='container.xl' // Limita a largura máxima
                // AJUSTE: Gap e Padding responsivos
                gap={{ base: 6, lg: 10 }}
                p={{ base: 6, md: 10, lg: 12 }}
                borderRadius={8}
            >
                {/* AJUSTE: Trocado Flex por Stack para um layout mais robusto e com divisor automático */}
                <Stack
                    direction={{ base: 'column', lg: 'row' }}
                    gap={{ base: 8, lg: 8 }}
                    align="stretch" // Garante que os filhos estiquem para preencher a altura
                >
                    {/* Coluna do Formulário */}
                    <Flex flex={1} minW={{ lg: '450px' }}> {/* Garante uma largura mínima na versão desktop */}
                        <form onSubmit={onSubmit} style={{ width: '100%' }}>
                            <Fieldset.Root size="lg" as={Flex} direction="column" h="100%">
                                <SearchTitle title={title} />
                                <Fieldset.Content>
                                    <VStack gap={6} align="stretch">
                                        <OperationSelect
                                            control={control}
                                            errors={errors}
                                            selectLabel={select}
                                        />
                                        <ExcelUpload
                                            register={register}
                                            inputLabel={input}
                                            inputDescription={inputDescription}
                                            downloadButtonLabel={downloadButton}
                                            downloadLink={downloadLink}
                                        />
                                    </VStack>
                                </Fieldset.Content>
                                {errors.planilha && <Fieldset.ErrorText mt={4} color="red.400">{errors.planilha.message}</Fieldset.ErrorText>}

                                <VStack mt="auto" pt={6} gap={4} align="stretch"> {/* Empurra os botões para baixo */}
                                    <Button
                                        type="submit"
                                        bgColor={'brand.500'}
                                        border='1px solid #FFFFFF55'
                                        color={'ghostWhite'}
                                        w="full"
                                        py={{ base: 6, md: 7 }}
                                        fontSize={{ base: 'lg', md: 'xl' }}
                                        gap={4}
                                        disabled={isProcessStarted}
                                        _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: ' 0.6s ease-in-out' }}
                                    >
                                        <PiPlayFill size={24} />
                                        INICIAR
                                    </Button>

                                    {isProcessFinished && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <Button
                                                onClick={handleSave}
                                                loading={isSaving}
                                                loadingText="Salvando..."
                                                color={'brand.500'}
                                                _hover={{ bgColor: 'brand.500', color: 'ghostWhite', transition: '0.6s ease-in-out' }}
                                                w="full"
                                                py={{ base: 6, md: 7 }}
                                                fontSize={{ base: 'lg', md: 'xl' }}
                                                gap={4}
                                            >
                                                <PiFloppyDiskFill size={24} />
                                                SALVAR RELATÓRIO
                                            </Button>
                                        </motion.div>
                                    )}
                                </VStack>
                            </Fieldset.Root>
                        </form>
                    </Flex>
                    <Flex borderLeft={'1px solid'} borderColor={'whiteAlpha.300'} h='auto' />
                    {/* Coluna do Painel de Descrição/Logs */}
                    <Flex flex={1.5}> {/* Faz esta coluna ser um pouco maior */}
                        <DescriptionPanel
                            description={newSearch.description}
                            logMessages={logMessages}
                            isProcessFinished={isProcessFinished}
                            isProcessStarted={isProcessStarted} />
                    </Flex>
                </Stack>
            </MotionFlex>
        </Flex>
    );
}
