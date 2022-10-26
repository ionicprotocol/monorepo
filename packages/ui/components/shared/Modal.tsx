import { Box, BoxProps } from '@chakra-ui/react';

import { useColors } from '@ui/hooks/useColors';

export const ModalDivider = (props: BoxProps) => {
  const { cCard } = useColors();

  return <Box h="1px" width="100%" flexShrink={0} bg={cCard.dividerColor} {...props} />;
};
