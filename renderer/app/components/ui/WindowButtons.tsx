'use client';

import { Flex, IconButton } from "@chakra-ui/react";
import { PiMinus, PiMinusBold, PiSquareBold, PiX, PiXBold } from "react-icons/pi";

export function WindowButtons() {

    const handleMinimize = () => window.ipc.window.minimize();
    const handleMaximize = () => window.ipc.window.maximize();
    const handleClose = () => window.ipc.window.close();
    return (

        <Flex position="absolute" top="0" right="0" zIndex={1} gap={0} px={6} py={4} className='non-draggable-region'>
            <IconButton
                borderRadius={'none'}
                aria-label="Minimize"
                _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: 'all 0.3s ease-in-out' }}
                color={'ghostWhite'}
                onClick={() => handleMinimize()}
                size="sm"
                colorScheme="gray"
                variant="ghost"
            >
                <PiMinusBold size={32} />
            </IconButton>
            <IconButton
                borderRadius={'none'}
                aria-label="Close"
                _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: 'all 0.3s ease-in-out' }}
                color={'ghostWhite'}
                onClick={() => handleMaximize()}
                size="sm"
                colorScheme="red"
                variant="ghost"
            >
                <PiSquareBold size={32} />
            </IconButton>
            <IconButton
                borderRadius={'none'}
                aria-label="Close"
                _hover={{ bgColor: 'ghostWhite', color: 'brand.500', transition: 'all 0.3s ease-in-out' }}
                color={'ghostWhite'}
                onClick={() => handleClose()}
                size="sm"
                colorScheme="red"
                variant="ghost"
            >
                <PiXBold size={32} />
            </IconButton>
        </Flex>
    )
}