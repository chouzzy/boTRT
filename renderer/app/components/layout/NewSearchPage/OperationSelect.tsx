import { Flex, Select, Portal, Text } from "@chakra-ui/react";
import { JSX } from "react";
import { FieldErrors, Controller, Control as RHFControl } from "react-hook-form";
import { operations } from "renderer/data/textData";
import { CustomText } from "../../ui/CustomText";


interface OperationSelectProps {
    control: RHFControl<FormData>; // Tipo do 'control' do react-hook-form
    errors: FieldErrors<FormData>;
    selectLabel: string | JSX.Element;
}


export function OperationSelect({ control, errors, selectLabel }: OperationSelectProps) {
    return (
        <Flex flexDir={'column'} gap={4} w='100%'>
            <Controller
                name="operacao"
                control={control}
                rules={{ required: 'É necessário selecionar uma operação.' }}
                render={({ field }) => (
                    <Select.Root
                        collection={operations}
                        width="100%"
                        value={field.value ? [field.value] : []}
                        onValueChange={(e) => field.onChange(e.value[0])}
                        required
                    >
                        <Select.HiddenSelect />
                        <Select.Label>
                            <CustomText text={selectLabel} fontWeight={'light'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' />
                        </Select.Label>
                        <Select.Control>
                            <Select.Trigger cursor={'pointer'} _hover={{border: '1px solid ghostWhite', transition: '0.6s ease-in-out'}}>
                                <Select.ValueText
                                    placeholder="Selecione"
                                    fontWeight={'medium'}
                                    fontSize={'sm'}
                                    textTransform={'uppercase'}
                                />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content>
                                    {operations.items.map((framework) => (
                                        <Select.Item item={framework} key={framework.value} cursor={'pointer'}>
                                            <CustomText text={framework.title} fontWeight={'medium'} fontSize={'sm'} textTransform={'uppercase'} pl={1} w='100%' letterSpacing={1.3} />
                                            <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                )}
            />
            {errors.operacao && <Text color="red.500" fontSize="sm" mt={2}>{errors.operacao.message}</Text>}
        </Flex>
    );
}