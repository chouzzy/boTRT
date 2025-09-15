'use client';

import { Flex, VStack, Heading, Text, Button, Link, Icon } from "@chakra-ui/react";
import { PiWhatsappLogo } from "react-icons/pi";

// Hooks existentes (mantidos caso sejam usados pelo seu layout)
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "renderer/contexts/LoadingContext";

export default function SupportPage() {
    // Número com o código do país (55 para o Brasil) para o link do WhatsApp
    const whatsappNumber = "5511971415567";
    const whatsappLink = `https://wa.me/${whatsappNumber}`;
    // Número formatado para exibição
    const displayPhoneNumber = "(11) 97141-5567";

    return (
        <Flex w='100%' minH='100vh' justifyContent='center' alignItems='center' p={4}>

            <VStack
                gap={6} // Espaçamento entre os elementos
                textAlign="center"
                maxW="lg" // Largura máxima para o conteúdo
            >
                {/* Ícone grande e chamativo */}
                <Icon as={PiWhatsappLogo} boxSize={{ base: 16, md: 20 }} color="whatsapp" />

                {/* Título da Página */}
                <Heading
                    as="h1"
                    fontSize={{ base: '2xl', md: '4xl' }}
                    fontWeight="bold"
                >
                    Precisa de Ajuda?
                </Heading>

                {/* Texto descritivo */}
                <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="gray.400"
                >
                    Para suporte técnico, dúvidas ou sugestões, entre em contato diretamente com nossa equipe pelo WhatsApp.
                </Text>

                {/* Botão de Ação */}
                <Link href={whatsappLink} target="_blank" _hover={{ textDecoration: 'none' }}>
                    <Button
                        bgColor={'brand.500'} // Usa o tema de cor do WhatsApp
                        size={'lg'}
                        py={7} // Altura do botão
                        px={8} // Largura do botão
                        fontSize={'lg'}
                        color={'white'}
                    >
                        <PiWhatsappLogo size={24} color="whatsapp"/>{' '}
                        Iniciar Conversa no WhatsApp
                    </Button>
                </Link>

                {/* Exibição do número de telefone */}
                <Text
                    fontSize="sm"
                    color="gray.500"
                >
                    {displayPhoneNumber}
                </Text>

            </VStack>

        </Flex>
    )
}
