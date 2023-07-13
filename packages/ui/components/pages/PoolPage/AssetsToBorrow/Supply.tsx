import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Supply = ({ asset }: { asset: MarketData }) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'green'}>Supply</Button>
    </Flex>
  );
};
