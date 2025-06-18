'use client';

import { Flex } from "@chakra-ui/react";
import { CustomText } from "../components/ui/CustomText";
import { PiBarricadeFill } from "react-icons/pi";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "renderer/contexts/LoadingContext";


export default function ScheduleSearchPage() {

    const { stopLoading } = useLoading();
    const pathname = usePathname();
    // Efeito para PARAR o loading quando a rota muda e o componente é renderizado
    useEffect(() => {
        // Um pequeno timeout para dar tempo da animação de fade-in da página acontecer
        const timer = setTimeout(() => {
            stopLoading();
        }, 300); // Ajuste este tempo se necessário

        return () => clearTimeout(timer);
    }, [pathname, stopLoading]); // Roda toda vez que o pathname muda

    return (
        <Flex w='100%' h='100vh' justifyContent='center' alignItems='center' flexDir='column' gap={4}>

            <CustomText text='Em construção' fontSize='2xl' fontWeight='semibold' textTransform='uppercase' />
            <PiBarricadeFill color="yellow" size={48} />

        </Flex>
    )
}