'use client'

import { Button, Field, Fieldset, Flex, For, Input, NativeSelect, Stack } from "@chakra-ui/react";
import { MultiSearchButton } from "./assets/MultiSearchButton";
import { SingleSearchButton } from "./assets/SingleSearchButton";

interface SelectOperationProps {
    multiOperation: boolean
    setMultiOperation: React.Dispatch<React.SetStateAction<boolean>>
    isOperationSelected: boolean
    setIsOperationSelected: React.Dispatch<React.SetStateAction<boolean>>
}

interface SelectOperationProps {
}

export function SelectOperation({
    isOperationSelected,
    setIsOperationSelected,
    multiOperation,
    setMultiOperation
}: SelectOperationProps) {

    return (
        <>
            <Fieldset.Root size="lg" maxW="md">
                <Stack>
                    <Fieldset.Legend>Contact details</Fieldset.Legend>
                    <Fieldset.HelperText>
                        Please provide your contact details below.
                    </Fieldset.HelperText>
                </Stack>

                <Fieldset.Content>
                    <Field.Root
                        fontSize={'0.875rem'}
                        fontWeight={'700'}
                        letterSpacing={'5%'}
                        color={'white'}
                        required
                    >
                        <Field.Label>Selecione o tipo de busca</Field.Label>
                        <Input name="name" />
                    </Field.Root>

                    <Field.Root>
                        <Flex justifyContent={'space-between'} gap={8}>
                            <SingleSearchButton
                                multiOperation={multiOperation}
                                setMultiOperation={setMultiOperation}
                                isOperationSelected={isOperationSelected}
                                setIsOperationSelected={setIsOperationSelected}
                            />
                            <MultiSearchButton
                                multiOperation={multiOperation}
                                setMultiOperation={setMultiOperation}
                                isOperationSelected={isOperationSelected}
                                setIsOperationSelected={setIsOperationSelected}
                            />
                        </Flex>
                    </Field.Root>

                </Fieldset.Content>
            </Fieldset.Root>
        </>
    )
}