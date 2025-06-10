
'use client'

import { Button, Flex, Input, Link, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { trtSchemaImportOperation } from "../Validation/FormValidator";
import { ValidationError } from "yup";
import { PiDownload } from "react-icons/pi";

interface ImportOperation {
    setFilePath: React.Dispatch<React.SetStateAction<string | null>>
    filePath: string
    painel: string
    setWarningAlert: React.Dispatch<React.SetStateAction<string | null>>
}

export function ImportOperation({ setFilePath, filePath, painel, setWarningAlert }: ImportOperation) {


    async function handleFileChange(event:any) {
        setFilePath(event.target.files[0].path)
    }

    async function startImportOperation() {
        setWarningAlert("")

        try {

            await trtSchemaImportOperation.validate({
                filePath,
                painel
            })
        } catch (error) {

            if (error instanceof ValidationError) {
                setWarningAlert(String(error.errors))
            }
            return
        }

        await window.ipc.sendExcelPath({ excelPath: filePath, operationType: painel })
    }

    const downloadLinks = {
        planilhaMinhaPautaDownloadURL: 'https://drive.usercontent.google.com/download?id=1ZLS1CNXeZBRsV4APt23kwtZUQmn0MaMv&export=download&authuser=0&confirm=t&uuid=6fbc74a2-606f-4ccc-b164-1d478c4b892a&at=APZUnTXt38cD9f3X8IyPl7qd-cke:1724260892790',
        planilhaArquivadosDownloadURL: 'https://drive.usercontent.google.com/download?id=15U7zZ157T04HHE0sxhIPLTTIh21FCjCs&export=download&authuser=0&confirm=t&uuid=2b1080ad-7052-4c0c-90be-9d02a9f2eed8&at=AO7h07e-vKqwLFzXEcg1KRyEwkq_:1727110599103',
    }

    const { planilhaArquivadosDownloadURL, planilhaMinhaPautaDownloadURL } = downloadLinks

    return (

        <Flex flexDir={'column'} gap={4}>
            {painel != 'Selecione' ?
                <>

                    <Flex p={1} color={'white'} w='100%' alignItems={'center'} justifyContent={'center'}>

                        <Flex flexDir={'column'} pt={4} gap={4}>


                            <Text>Para executar a operação, baixe a planilha modelo no botão abaixo:</Text>

                            <Button
                                bgColor={'#FF5F5E'}
                                color={'white'}
                                _hover={{ color: '#33c481' }}
                                mx='auto'
                                w='sm'
                            >

                                <Link
                                    href={painel == 'Minha pauta' ? planilhaMinhaPautaDownloadURL : planilhaArquivadosDownloadURL}
                                    target="_blank"
                                    _hover={{ textDecoration: 'none', color: 'teal.200' }}
                                >
                                    <Flex gap={4} alignItems={'center'} >
                                        <Text>Download planilha modelo</Text>
                                        <Flex gap={1} alignItems={'center'}>

                                            <PiDownload fontSize={'1.25rem'} />
                                        </Flex>

                                    </Flex>
                                </Link>
                            </Button>
                        </Flex>

                    </Flex>

                    <Flex alignItems={'center'} justifyContent={'center'} flexDir={'column'} gap={8}>

                        <Input
                            id='fileInput'
                            type='file'
                            accept='xlsx'
                            bgColor={'gray.200'}
                            color={'gray.800'}
                            _hover={{ color: '#33c481' }}
                            onChange={handleFileChange}
                            w='sm'
                            py={1}
                            cursor={'pointer'}
                        />

                        <Button
                            onClick={startImportOperation}
                            bgGradient='linear(to-l, #dd0000, #F55F5E)'
                            border='1px solid #FFFFFF55'
                            color={'white'}
                            _hover={{ color: '#33c481' }}
                            w='sm'
                        >
                            <Flex gap={4} alignItems={'center'}>
                                Start
                            </Flex>
                        </Button>
                    </Flex>
                </>
                :
                ''
            }
        </Flex>
    )
}