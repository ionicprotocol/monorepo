import { Grid } from '@chakra-ui/react';

import { PoolStat } from '@ui/components/pages/Fuse/FusePoolPage/PoolStats/PoolStat';
import { PoolData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';

export const PoolStats = ({ poolData }: { poolData: PoolData | null | undefined }) => {
  return (
    <Grid
      templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
      gap={4}
      w="100%"
      my={4}
    >
      <PoolStat
        label="Total Supply"
        value={poolData ? midUsdFormatter(poolData.totalSuppliedFiat) : undefined}
      />
      <PoolStat
        label="Total Borrow"
        value={poolData ? midUsdFormatter(poolData?.totalBorrowedFiat) : undefined}
      />
      <PoolStat
        label="Liquidity"
        value={poolData ? midUsdFormatter(poolData?.totalAvailableLiquidityFiat) : undefined}
      />
      <PoolStat
        label="Utilization"
        value={poolData ? poolData.utilization.toFixed(2) + '%' : undefined}
      />
    </Grid>
  );
};
