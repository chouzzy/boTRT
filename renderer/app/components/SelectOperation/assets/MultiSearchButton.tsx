'use client'

import { Button, Flex, Text } from "@chakra-ui/react"
import { PiMicrosoftExcelLogoBold } from "react-icons/pi"

interface MultiSearchButtonProps {
    multiOperation: boolean
    setMultiOperation: React.Dispatch<React.SetStateAction<boolean>>
    isOperationSelected: boolean
    setIsOperationSelected: React.Dispatch<React.SetStateAction<boolean>>
}



export function MultiSearchButton({
    isOperationSelected,
    setIsOperationSelected,
    multiOperation,
    setMultiOperation
}: MultiSearchButtonProps) {

    return (
        <Button
            w='100%'
            onClick={() => { setMultiOperation(true), setIsOperationSelected(true) }}
            bgColor={
                isOperationSelected ?
                    multiOperation ? '#FF5F5E' : '#21a366'
                    :
                    '#21a366'
            }
            color={'white'}
            _hover={{ bgColor: multiOperation ? '#FF5F5E' : '#33c481' }}
        >
            <Flex gap={4} alignItems={'center'}>
                <Text>Busca em massa</Text>
                <Flex gap={1} alignItems={'center'}>

                    {/* <AttachmentIcon _hover={{ bgColor: '#21a366', transition: '300ms' }} fontSize={'1.25rem'} /> */}
                    <PiMicrosoftExcelLogoBold fontSize={'1.5rem'} />
                </Flex>

            </Flex>
        </Button>
    )
}