'use client'

import { Button } from "@chakra-ui/react";

interface SaveButtonProps {
    saveFilePath: () => Promise<void>
    file: boolean
    disable: boolean
}

export function SaveButton({ file, saveFilePath, disable }: SaveButtonProps) {

    return (
        <Button
            mx='auto'
            variant="solid"
            type='submit'
            disabled = {disable}
            onClick={
                file ?
                    () => { '' }
                    :
                    () => saveFilePath()
            }
            color='white'
            bgGradient={
                file ?
                    'linear(to-br, #292f36, #292f36cc)'
                    :
                    'linear(to-br, #FF5F5E, #FF5F5Ecc)'
            }
            rounded="button"
            width={'100%'}
            cursor={
                file ?
                    'default'
                    :
                    'pointer'
            }
            _hover={{ color: 'gray.200', transition: '500ms', textDecor: 'none' }}
        >
            Salvar
        </Button>
    )
}