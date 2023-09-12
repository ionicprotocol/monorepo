import { Button, Flex } from '@chakra-ui/react';

import type { PoolData } from '@ui/types/TokensDataMap';

export const Claim = ({ pool }: { pool: PoolData }) => {
  console.warn({ pool });

  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'solidGreen'}>Claim</Button>
    </Flex>
  );
};
