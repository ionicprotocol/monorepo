import { Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { PoolData } from '@ui/types/TokensDataMap';

export const Supply = ({ pool }: { pool: PoolData }) => {
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button
        onClick={() => {
          setGlobalLoading(true);
          router.push(`/lend/${pool.chainId}/pool/${pool.id}`);
        }}
        variant={'solidGreen'}
      >
        Supply
      </Button>
    </Flex>
  );
};
