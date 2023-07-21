import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Repay = ({ asset }: { asset: MarketData }) => {
  console.warn(asset.cToken);

  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'green'}>Repay</Button>
    </Flex>
  );
};
