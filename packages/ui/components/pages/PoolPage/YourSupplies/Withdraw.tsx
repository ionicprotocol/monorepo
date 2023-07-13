import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Withdraw = ({ asset }: { asset: MarketData }) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'green'}>Withdraw</Button>
    </Flex>
  );
};
