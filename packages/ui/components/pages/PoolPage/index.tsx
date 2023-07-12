import { Box, Flex, Grid, Skeleton } from '@chakra-ui/react';
import type { SortingState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import PoolDetails from '@ui/components/pages/PoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/PoolPage/PoolStats';
import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { YourBorrows } from '@ui/components/pages/PoolPage/YourBorrows';
import { YourSupplies } from '@ui/components/pages/PoolPage/YourSupplies';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { IONIC_LOCALSTORAGE_KEYS, MARKET_COLUMNS, MARKET_LTV } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useRewards } from '@ui/hooks/useRewards';

const PoolPage = memo(() => {
  const { address } = useMultiIonic();
  const router = useRouter();
  const poolId = router.query.poolId as string;
  const chainId = router.query.chainId as string;
  const { data } = useFusePoolData(poolId, Number(chainId));
  const { data: allRewards } = useRewards({ chainId: Number(chainId), poolId: poolId });
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();

  useEffect(() => {
    const oldData = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).marketSorting &&
      MARKET_COLUMNS.includes(JSON.parse(oldData).marketSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).marketSorting);
    } else {
      setInitSorting([{ desc: true, id: MARKET_LTV }]);
    }
  }, []);

  return (
    <>
      {data && (
        <Head>
          <title key="title">{data.name}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <FusePageLayout>
          <Flex mb={'20px'}>
            <PoolDetails chainId={chainId} poolId={poolId} />
          </Flex>
          <Flex direction={{ base: 'column', md: 'row' }} gap={'20px'}>
            <YourSupplies />
            <YourBorrows />
          </Flex>
          <PoolStats poolData={data} />
          <CardBox mb="4" overflowX="auto" width="100%">
            {data && initSorting && allRewards ? (
              <></>
            ) : (
              // <MarketsList
              //   initColumnVisibility={initColumnVisibility}
              //   initHidden={initHidden}
              //   initSorting={initSorting}
              //   poolData={data}
              //   rewards={allRewards}
              // />
              <>
                <Box gap={4} p={4}>
                  {address ? (
                    <>
                      <Grid
                        gap={4}
                        mb={4}
                        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                        w="100%"
                      >
                        <UserStat label="Your Supply" />
                        <UserStat label="Your Borrow" />
                        <UserStat label="Effective Supply APY" />
                        <UserStat label="Effective Borrow APY" />
                      </Grid>
                      <Skeleton borderRadius={'xl'} height={'60px'} mb={4} width="100%" />
                    </>
                  ) : null}

                  <Flex alignItems="center" justifyContent={'space-between'}>
                    <Flex flexDirection={['row']} gap={0}>
                      <Skeleton
                        borderEndRadius={0}
                        borderStartRadius={'xl'}
                        height={'52px'}
                        width={'72px'}
                      />
                      <Skeleton borderRadius={0} height={'52px'} width={'120px'} />
                      <Skeleton
                        borderEndRadius={'xl'}
                        borderStartRadius={0}
                        height={'52px'}
                        width={'120px'}
                      />
                    </Flex>
                    <Skeleton height={'40px'} width={'320px'} />
                  </Flex>
                </Box>
                <Skeleton height={360} width="100%" />
              </>
            )}
          </CardBox>
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default PoolPage;
