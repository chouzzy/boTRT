'use client'

import { Flex, Image } from "@chakra-ui/react";


export function Logo() {

    return (
        <Flex
            maxW={'250px'}
            maxH={'250px'}
            mt={12}
        >

            <Image
                alt="Logo icon"
                src={'/images/logos/boTRT-logo.png'}
                width={'250px'}
                height={'250px'}
            />
        </Flex>
    )
}