'use client';

import { useState } from 'react';
import {
    Flex,
    Heading,
    Text,
    VStack,
    Input,
    Button,
    Spinner,
    // A MUDANÇA: Importando os novos componentes de formulário
    Fieldset,
    Field
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { toaster } from '../components/ui/toaster';

export default function CeatPage() {
    const [cnpj, setCnpj] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Validação simples do CNPJ
        if (!cnpj.trim()) {
            toaster.create({
                title: "Campo Obrigatório",
                description: "Por favor, insira um CNPJ para a busca.",
                type: "warning",
                duration: 5000,
                closable: true,
            });
            return;
        }

        console.log(`[Frontend] Enviando CNPJ para o main process: ${cnpj}`);
        setIsLoading(true);

        window.ipc.scrapeCeat(cnpj);
    };

    const MotionFlex = motion(Flex);

    return (
        <MotionFlex
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            direction="column"
            w="100%"
            flex={1}
            p={{ base: 4, md: 8 }}
            align="center"
            justify="center"
        >
            {/* A MUDANÇA: O VStack agora é apenas para layout, o 'form' é o Fieldset */}
            <VStack
                w="100%"
                maxW="xl"
                gap={8}
            >
                <VStack align="center" textAlign="center">
                    <Heading as="h1" size="xl">
                        Extração de Processos (CEAT)
                    </Heading>
                    <Text color="gray.400">
                        Insira o CNPJ da parte para buscar a Certidão Eletrónica de Ações Trabalhistas e extrair os processos associados.
                    </Text>
                </VStack>

                {/* A MUDANÇA: Usando Fieldset.Root como o container do formulário */}
                <Fieldset.Root as="form" onSubmit={handleSubmit} w="100%" disabled={isLoading}>
                    <Fieldset.Content>
                        <Field.Root required>
                            <Field.Label>CNPJ da Parte</Field.Label>
                            <Input
                                id="cnpj"
                                type="text"
                                placeholder="00.000.000/0000-00"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>
                                O robô irá aceder ao portal do TRT-15 para gerar e analisar a certidão.
                            </Field.HelperText>
                        </Field.Root>
                    </Fieldset.Content>

                    <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        w="100%"
                        mt={8} // Adicionado espaçamento
                        loading={isLoading}
                    >
                        {isLoading ? 'A extrair...' : 'Iniciar Extração'}
                    </Button>
                </Fieldset.Root>

            </VStack>
        </MotionFlex>
    );
}

