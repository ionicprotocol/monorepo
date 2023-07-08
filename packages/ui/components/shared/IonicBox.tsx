import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export type IonicBoxProps = BoxProps;

export const IonicBox = ({ children, ...props }: IonicBoxProps) => {
  const { cICard } = useColors();

  return (
    <Box
      backgroundColor={cICard.bgColor}
      borderRadius={{ base: '24px' }}
      borderWidth={0}
      color={cICard.txtColor}
      px={{ base: '32px' }}
      py={{ base: '20px' }}
      {...props}
    >
      {children}
    </Box>
  );
};
