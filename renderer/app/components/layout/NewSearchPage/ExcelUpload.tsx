import { Button, FileUpload, Fieldset, Flex, Box } from "@chakra-ui/react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { JSX } from "react";
import { UseFormRegister } from "react-hook-form";
import { PiDownloadSimpleFill, PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { CustomText } from "../../ui/CustomText";


// 3. Componente para o Upload de Arquivo
interface ExcelUploadProps {
    register: UseFormRegister<FormData>;
    inputLabel: string | JSX.Element;
    inputDescription: string | JSX.Element;
    downloadButtonLabel: string;
    downloadLink: string;
}

export function ExcelUpload({ register, inputLabel, inputDescription, downloadButtonLabel, downloadLink }: ExcelUploadProps) {
    const MotionButton = motion(Button); // Recriado aqui para manter o componente autocontido
    const buttonVariants: Variants = {
        initial: { color: '#FFFFFF' },
        hover: { backgroundColor: '#FF5F5E', transition: { duration: 0.1, ease: 'easeInOut' } },
        tap: { scale: 0.80 }
    };
    
    return (
        <FileUpload.Root maxW="100%" alignItems="stretch" maxFiles={1} gap={4}>
            <Fieldset.Legend>
                <CustomText text={inputLabel} fontWeight={'light'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' />
            </Fieldset.Legend>
            <Fieldset.Legend>
                <MotionButton variants={buttonVariants} initial='initial' whileHover='hover' whileTap="tap" bgColor={'transparent'} border='1px solid' color={'ghostWhite'} borderColor={'ghostWhite'} w='100%' textTransform={'uppercase'}>
                    <Link href={downloadLink} style={{ textDecoration: 'none', color: 'inherit' }} target='_blank'>
                        <Flex gap={2} alignItems={'center'}>
                            <PiDownloadSimpleFill />
                            <CustomText text={downloadButtonLabel} />
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
    );
}