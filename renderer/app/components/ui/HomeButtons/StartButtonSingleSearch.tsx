'use client';

import { Button } from "@chakra-ui/react";
import { handleSubmitSingleSearch } from "../../../services/SingleSearch";

interface SingleSearchProps {
    singleSearchData: {
        painel: string,
        initialDate: string,
        finalDate: string,
        setWarningAlert: React.Dispatch<React.SetStateAction<string>>,
        username: string,
        password: string,
        trt: string
    }
}

export function StartButtonSingleSearch(singleSearchData: SingleSearchProps) {

    return (
        <Button
            mx='auto'
            variant="solid"
            type='submit'
            onClick={() => handleSubmitSingleSearch(singleSearchData)}
            color='white'
            bgGradient='linear(to-br, #FF5F5E, #FF5F5Ecc)'
            rounded="button"
            width={'100%'}
            _hover={{ color: 'gray.200', transition: '500ms', textDecor: 'none' }
            }
        >
            Clique para iniciar a single search
        </Button>
    )
}