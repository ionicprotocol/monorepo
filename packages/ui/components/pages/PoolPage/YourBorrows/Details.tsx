import { Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Details = ({
  asset,
  chainId,
  poolId
}: {
  asset: MarketData;
  chainId: number;
  poolId: number;
}) => {
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button
        onClick={() => {
          setGlobalLoading(true);
          router.push(`/${chainId}/pool/${poolId}/${asset.cToken}`);
        }}
        variant={'outlineLightGray'}
      >
        Details
      </Button>
    </Flex>
  );
};
