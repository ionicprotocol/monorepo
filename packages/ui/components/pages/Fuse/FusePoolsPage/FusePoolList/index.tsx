import { SimpleGrid as Grid, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { PoolsRowList } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { AlertHero } from '@ui/components/shared/Alert';
import { useCrossFusePools } from '@ui/hooks/fuse/useFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

export type Err = Error & { code?: string; reason?: string };

const FusePoolList = () => {
  const enabledChains = useEnabledChains();
  const { isLoading, allPools, error } = useCrossFusePools([...enabledChains]);
  const [err, setErr] = useState<Err | undefined>(error as Err);

  useEffect(() => {
    setErr(error as Err);
  }, [error]);

  if (err && err.code !== 'NETWORK_ERROR') {
    return (
      <AlertHero
        status="warning"
        variant="subtle"
        title={err.reason ? err.reason : 'Unexpected Error'}
        description="Unable to retrieve Pools. Please try again later."
      />
    );
  }

  return (
    <Grid mt={8} w={'100%'} mx="auto" gap={4}>
      {!isLoading ? (
        <>
          {allPools && allPools.length > 0 ? (
            <PoolsRowList allPools={allPools} />
          ) : (
            <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} my={24}>
              No pools found
            </Text>
          )}
        </>
      ) : (
        <Stack width="100%" mx="auto" mt={2}>
          <Skeleton height="80px" borderRadius={12} />
          <Skeleton height="80px" borderRadius={12} />
          <Skeleton height="80px" borderRadius={12} />
        </Stack>
      )}
    </Grid>
  );
};

export default FusePoolList;
