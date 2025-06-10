'use client'

import { Field, Fieldset, Input, NativeSelect, Select, Stack } from "@chakra-ui/react"


interface SelectPainelProps {

    painel: string,
    setPainel: React.Dispatch<React.SetStateAction<string>>
}

export function SelectPainel({ painel, setPainel }: SelectPainelProps) {

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
                        Selecione o painel
                    </Field.Label>
                    <Input name="name" />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Email address</Field.Label>
                    <Input name="email" type="email" />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Country</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            name='scrape'
                            id='#scrape'
                            color={'black'}
                            bg={'white'}
                            _hover={{ bg: 'purple.600', color: 'white' }}
                            value={painel}
                            onChange={(event) => { setPainel(event.target.value) }}
                        >
                            <option style={{ color: 'black' }}>{'Selecione'}</option>
                            <option style={{ color: 'black' }}>{'Minha pauta'}</option>
                            <option style={{ color: 'black' }}>{'Processos arquivados'}</option>
                            <option style={{ color: 'black' }}>{'Acervo geral'}</option>
                            {/* <option style={{ color: 'black' }}>{'Pendentes de manifestação'}</option> */}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>
            </Fieldset.Content>
        </Fieldset.Root>

    )
}