import { Box, BoxProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const PoolDashboardBox = ({ children, ...props }: BoxProps) => {
  const { cCard } = useColors();
  return (
    <Box
      backgroundColor={cCard.bgColor}
      borderRadius={10}
      borderWidth={2}
      borderColor={cCard.borderColor}
      color={cCard.txtColor}
      {...props}
    >
      {children}
    </Box>
  );
};
