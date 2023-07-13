import { Badge, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const AprType = ({ asset }: { asset: MarketData }) => {
  console.warn({ asset });

  return (
    <Flex justifyContent={'center'}>
      <Badge>VARIABLE</Badge>
    </Flex>
  );
};
