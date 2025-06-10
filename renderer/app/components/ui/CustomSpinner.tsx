import { Spinner, SpinnerProps } from '@chakra-ui/react';
import React from 'react';

interface CustomSpinnerProps extends Omit<SpinnerProps, 'boxSize' | 'color'> {
    boxSize?: string | number;
    color?: string;
}

const CustomSpinner: React.FC<CustomSpinnerProps> = ({
    boxSize = '40px',
    color = 'spinnerColor',
    ...rest
}) => {
    return <Spinner mx="auto" boxSize={boxSize} color={color} {...rest} />;
};

export default CustomSpinner;