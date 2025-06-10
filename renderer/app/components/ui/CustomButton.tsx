import { Button, ButtonProps as ChakraButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ChakraButtonProps {
    text?: string,
    isDark?: boolean,
    bgColorHover?: string,
    colorHover?: string
}

export function CustomButton({ text = 'Consulte agora', color = 'buttonColor', bgColorHover = 'buttonBgHover', colorHover = 'buttonColorHover', ...restProps }: CustomButtonProps) {

    if (restProps.isDark) {
        color = 'buttonColor'
        bgColorHover = 'buttonDarkBgHover'
        colorHover = 'buttonDarkColorHover'
    }
    
    return (
        <Button {...restProps}
            fontWeight={'normal'}
            bgColor='buttonBg'
            color={color}
            rounded={restProps.rounded ?? 'md'}
            _hover={{
                bgColor:'buttonBgHover',
                color: colorHover,
                transition: '600ms ease-in-out',
            }}>
            {text}
        </Button>
    )
}