import { Fieldset } from "@chakra-ui/react";
import { JSX } from "react";
import { CustomText } from "../../ui/CustomText";

// 1. Componente para o Título Principal
interface SearchTitleProps {
    title: string | JSX.Element;
}
export function SearchTitle({ title }: SearchTitleProps) {
    return (
        <Fieldset.Legend w='100%' mb={4}>
            <CustomText text={title} textAlign='center' fontSize={'3xl'} fontWeight={'semibold'} textTransform={'uppercase'} pl={1} />
        </Fieldset.Legend>
    );
}
