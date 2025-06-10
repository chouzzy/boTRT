'use client'

import { Field, Fieldset, Input, NativeSelect, Stack } from "@chakra-ui/react"
import { TRTMinhaPauta } from "./Options/TRTMinhaPauta"
import { TRTProcessosArquivados } from "./Options/TRTProcessosArquivados"

interface SelectTRTProps {
    trt: string
    setTRT: React.Dispatch<React.SetStateAction<string>>
    painel: string
}

export function SelectTRT({ trt, setTRT, painel }: SelectTRTProps) {

    return (


        <Fieldset.Root size="lg" maxW="md">
            <Stack>
                <Fieldset.Legend>Contact details</Fieldset.Legend>
                <Fieldset.HelperText>
                    Please provide your contact details below.
                </Fieldset.HelperText>
            </Stack>

            <Fieldset.Content>
                <Field.Root>
                    <Field.Label fontSize={'0.875rem'}
                        fontWeight={'700'}
                        letterSpacing={'5%'}
                        color={'white'}
                    >
                        Selecione o TRT</Field.Label>
                    <Input name="name" />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Email address</Field.Label>
                    <Input name="email" type="email" />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Country</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field id='#TRT'
                            color={'black'}
                            bg={'white'}
                            _hover={{ bg: 'purple.600', color: 'white' }}
                            value={trt}
                            onChange={(event) => { setTRT(event.target.value) }}
                        >

                            {
                                painel == "Minha pauta" ?
                                    <TRTMinhaPauta />
                                    :
                                    ''
                            }
                            {
                                painel == "Processos arquivados" ?
                                    <TRTProcessosArquivados />
                                    :
                                    ''
                            }
                            {
                                painel == "Acervo geral" ?
                                    <TRTProcessosArquivados />
                                    :
                                    ''
                            }
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>
            </Fieldset.Content>

        </Fieldset.Root>

    )
}