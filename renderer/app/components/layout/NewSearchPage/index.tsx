// src/app/pages/NewSearch.tsx (ou onde seu componente principal está)
'use client';

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useForm } from "react-hook-form";
import { usePathname } from 'next/navigation';

// Chakra UI & Icons
import { Button, Fieldset, Flex, VStack } from '@chakra-ui/react';
import { PiFloppyDiskFill, PiPlayFill } from 'react-icons/pi';

// Contexts, Data, e Componentes Customizados
import { useLoading } from 'renderer/contexts/LoadingContext';
import { newSearch } from 'renderer/data/textData';
import { OperationSelect } from './OperationSelect';
import { SearchTitle } from './SearchTitle';
import { DescriptionPanel } from './DescriptionPanel';
import { ExcelUpload } from './ExcelUpload';
import { toaster } from '../../ui/toaster';

// 5. Componente Principal NewSearch (Agora muito mais limpo!)
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
                setIsProcessFinished(true); // Habilita o botão de salvar
                setIsProcessStarted(false); // Reseta o estado de início do processo
                toaster.create({
                    title: 'Busca Concluída!',
                    description: payload.message || "Os dados estão prontos para serem salvos.",
                    type: 'success',
                    duration: 5000,
                    closable: true,
                });
            } else {
                toaster.create({
                    title: 'Erro no Processamento',
                    description: payload.error || "Ocorreu um erro durante a busca.",
                    type: 'error',
                    duration: 9000,
                    closable: true,
                });
            }

        });

        return () => unsubscribe();
    }, []); // Adicionado toast como dependência


    // NOVO: useEffect para ouvir os logs do backend
    useEffect(() => {
        const unsubscribe = window.ipc.progressMessagesDetails((payload) => {
            console.log("Log Recebido:", payload.message);
            // Adiciona a nova mensagem ao início da lista
            setLogMessages((prevLogs) => [...prevLogs, payload.message]);
        });

        return () => unsubscribe(); // Limpa o listener
    }, []); // Roda apenas uma vez

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
                    const buffer = Buffer.from(arrayBuffer);
                    resolve(buffer);
                } else {
                    reject(new Error("Não foi possível ler o arquivo."));
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsArrayBuffer(file);
        });
    };


    const onSubmit = handleSubmit(async (data) => {
        setLogMessages([]);
        setIsProcessFinished(false);
        setIsProcessStarted(true); // Marca que o processo foi iniciado
        const { operacao, planilha } = data;
        console.log("Dados submetidos:", data);

        console.log(`Operação selecionada: ${operacao}`);

        if (!planilha || planilha.length === 0) {
            setError('planilha', { type: 'manual', message: 'É necessário fazer o upload de uma planilha.' });
            return;
        }

        const primeiroArquivo = planilha[0];

        try {
            console.log(`Lendo o conteúdo do arquivo: ${primeiroArquivo.name}`);
            const fileBuffer = await readFileAsBuffer(primeiroArquivo);

            console.log(`Enviando conteúdo do arquivo para o Main Process...`);
            // Agora, em vez de enviar um 'path', enviamos o 'buffer' do arquivo.
            // Você precisará de um novo canal IPC ou adaptar o existente.
            // Vamos usar um novo para clareza: 'process-excel-file'
            await window.ipc.processUploadedExcel({
                fileBuffer: fileBuffer,
                fileName: primeiroArquivo.name, // Opcional, mas útil para logs no backend
                operationType: operacao
            });

        } catch (error) {
            console.error("Erro ao ler ou processar o arquivo:", error);
            setError('planilha', { type: 'manual', message: 'Ocorreu um erro ao ler o arquivo.' });
        }
    });


    // Nova função para lidar com o salvamento
    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log("Chamando 'dialog:save-excel' no main process...");
            // Chama o handler que abre o diálogo e salva o arquivo
            const result = await window.ipc.triggerSaveExcelDialog();

            if (result.success) {
                toaster.create({
                    title: 'Sucesso!',
                    description: result.message || 'Arquivo salvo com sucesso.',
                    type: 'success',
                    duration: 5000,
                    closable: true,
                });
                setIsProcessFinished(false); // Reseta o estado para permitir uma nova busca
            } else {
                throw new Error(result.error || "O salvamento foi cancelado ou falhou.");
            }
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            toaster.create({
                title: 'Erro ao Salvar',
                description: error.message,
                type: 'error',
                duration: 9000,
                closable: true,
            });
        } finally {
            setIsSaving(false);
            setIsProcessStarted(false); // Reseta o estado de início do processo
        }
    };

    return (
        <Flex flexDir={'column'}  w='100%' h='100vh' bg={'transparent'} justifyContent={'center'} alignItems='center'>
            <MotionFlex variants={HomeVariants} initial='initial' bgColor={'cardBg'} animate='visible' flexDir={'column'} w='breakpoint-xl' gap={12} p={16} borderRadius={40}>
                <Flex gap={8}>
                    <form onSubmit={onSubmit}>
                        <Fieldset.Root size="lg">
                            <SearchTitle title={title} />
                            <Fieldset.Content>
                                <VStack gap={6}>
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
                            <Button
                                type="submit"
                                bgColor={'brand.500'}
                                border='1px solid #FFFFFF55'
                                color={'ghostWhite'}
                                w="full"
                                mt={8}
                                py={8}
                                fontSize={'2xl'}
                                gap={4}
                                _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: ' 0.6s ease-in-out' }}
                            >
                                <PiPlayFill size={24} />
                                INICIAR
                            </Button>

                            {/* BOTÃO DE SALVAR QUE APARECE CONDICIONALMENTE */}
                            {isProcessFinished && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Button
                                        onClick={handleSave}
                                        loading={isSaving}
                                        loadingText="Salvando..."
                                        color={'brand.500'}
                                        _hover={{ bgColor: 'brand.500', color: 'ghostWhite', transition: '0.6s ease-in-out' }}
                                        w="full"
                                        mt={4} // Espaçamento
                                        py={8}
                                        fontSize={'xl'}
                                        gap={4}
                                    >
                                        <PiFloppyDiskFill size={24} />
                                        SALVAR RELATÓRIO
                                    </Button>
                                </motion.div>
                            )}
                        </Fieldset.Root>
                    </form>
                    <Flex borderLeft={'1px solid'} borderColor={'whiteAlpha.300'} h='auto' />
                    <DescriptionPanel description={newSearch.description} logMessages={logMessages} isProcessFinished={isProcessFinished} isProcessStarted={isProcessStarted}/>
                </Flex>
            </MotionFlex>
        </Flex>
    );
}
