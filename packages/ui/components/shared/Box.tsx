import { Box, BoxProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export type MidasBoxProps = BoxProps;

export const MidasBox = ({ children, ...props }: MidasBoxProps) => {
  const { cCard } = useColors();

  return (
    <Box
      backgroundColor={cCard.bgColor}
      borderColor={cCard.borderColor}
      borderRadius={'xl'}
      borderWidth={2}
      color={cCard.txtColor}
      {...props}
    >
      {children}
    </Box>
  );
};
