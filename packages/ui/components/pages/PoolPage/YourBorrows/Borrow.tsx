import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Borrow = ({ asset }: { asset: MarketData }) => {
  console.warn(asset.cToken);

  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'outline'}>Borrow</Button>
    </Flex>
  );
};
