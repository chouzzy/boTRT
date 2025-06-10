'use client'

import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { PiWarning, PiX } from "react-icons/pi";

interface warningAlertProps {
    warningAlert: string
    setWarningAlert: React.Dispatch<React.SetStateAction<string>>
}

export function WarningAlert({ warningAlert, setWarningAlert }: warningAlertProps) {

    return (
        <Flex position='relative' mt={4} bg='#FF5F5E' borderRadius={4} color='white' alignItems={'center'}>
            <Flex gap={4} p={2} mr={4} minW={64}>
                <Flex> <PiWarning fontSize={24} /> </Flex>
                <Flex> <Text fontSize={'0.875rem'}> {warningAlert} </Text> </Flex>
            </Flex>

            <Flex
                onClick={() => setWarningAlert("")}
                cursor={'pointer'}
                _hover={{ color: 'red.700', transition: '300ms' }}
                fontSize={'0.64rem'}
                position={'absolute'}
                top={1}
                right={1}
            >
                <PiX />
            </Flex>
        </Flex>
    )
}