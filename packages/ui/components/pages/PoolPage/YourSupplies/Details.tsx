import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Details = ({ asset }: { asset: MarketData }) => {
  console.warn(asset.cToken);

  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'outline'}>Details</Button>
    </Flex>
  );
};
