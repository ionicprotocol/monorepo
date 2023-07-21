import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export type IonicBoxProps = BoxProps;

export const CardBox = ({ children, ...props }: IonicBoxProps) => {
  const { cICard } = useColors();

  return (
    <Box
      backgroundColor={cICard.bgColor}
      borderRadius={{ base: '24px' }}
      borderWidth={0}
      color={cICard.txtColor}
      px={{ base: '32px' }}
      py={{ base: '20px' }}
      width={'100%'}
      {...props}
    >
      {children}
    </Box>
  );
};

export const RowBox = ({ children, ...props }: IonicBoxProps) => {
  const { cIRow } = useColors();

  return (
    <Box
      backgroundColor={cIRow.bgColor}
      borderRadius={{ base: '20px' }}
      borderWidth={0}
      color={cIRow.txtColor}
      px={{ base: '16px' }}
      py={{ base: '16px' }}
      {...props}
    >
      {children}
    </Box>
  );
};
