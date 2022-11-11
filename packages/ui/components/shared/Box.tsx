import { Box, BoxProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export type MidasBoxProps = BoxProps;

export const MidasBox = ({ children, ...props }: MidasBoxProps) => {
  const { cCard } = useColors();
  return (
    <Box
      backgroundColor={cCard.bgColor}
      borderRadius={'xl'}
      borderWidth={2}
      borderColor={cCard.borderColor}
      color={cCard.txtColor}
      {...props}
    >
      {children}
    </Box>
  );
};
