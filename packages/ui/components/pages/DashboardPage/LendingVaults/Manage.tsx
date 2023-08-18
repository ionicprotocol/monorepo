import { Button, Flex } from '@chakra-ui/react';

import type { PoolData } from '@ui/types/TokensDataMap';

export const Manage = ({ pool }: { pool: PoolData }) => {
  return (
    <Flex justifyContent={'flex-end'}>
      <Button variant={'outlineLightGray'}>Manage</Button>
    </Flex>
  );
};
