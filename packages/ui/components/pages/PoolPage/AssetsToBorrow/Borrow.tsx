import { Button, Flex } from '@chakra-ui/react';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Borrow = ({ asset }: { asset: MarketData }) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <Button isDisabled variant={'green'}>
        Borrow
      </Button>
    </Flex>
  );
};
