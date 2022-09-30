import { SimpleGrid as Grid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { PoolsRowList } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/index';
import { AlertHero } from '@ui/components/shared/Alert';
import { MidasBox } from '@ui/components/shared/Box';
import { TableSkeleton } from '@ui/components/shared/TableSkeleton';
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
        <MidasBox overflowX="auto" width="100%" mb="4">
          <TableSkeleton tableHeading="Pools" />
        </MidasBox>
      )}
    </Grid>
  );
};

export default FusePoolList;
