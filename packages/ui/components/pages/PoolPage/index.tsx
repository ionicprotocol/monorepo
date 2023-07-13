import { Box, Center, Flex, Grid, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { SortingState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';

import { AssetsToBorrow } from './AssetsToBorrow';
import { AssetsToSupply } from './AssetsToSupply';
import { YourSupplies } from './YourSupplies';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import PoolDetails from '@ui/components/pages/PoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/PoolPage/PoolStats';
import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { IONIC_LOCALSTORAGE_KEYS, MARKET_COLUMNS, MARKET_LTV } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useRewards } from '@ui/hooks/useRewards';

const PoolPage = memo(() => {
  const { address } = useMultiIonic();
  const router = useRouter();
  const poolId = useMemo(
    () => (router.isReady ? (router.query.poolId as string) : ''),
    [router.isReady, router.query.poolId]
  );
  const chainId = useMemo(
    () => (router.isReady ? (router.query.chainId as string) : ''),
    [router.isReady, router.query.chainId]
  );
  const { data: poolData, isLoading: isPoolDataLoading } = useFusePoolData(poolId, Number(chainId));
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
      {poolData && (
        <Head>
          <title key="title">{poolData.name}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <FusePageLayout>
          <Flex mb={'20px'}>
            <PoolDetails chainId={chainId} poolId={poolId} />
          </Flex>
          <Flex direction={{ base: 'column', md: 'row' }} gap={'20px'}>
            <CardBox overflowX="auto" width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                  <Skeleton minW={'100%'} />
                </VStack>
              ) : poolData ? (
                <YourSupplies poolData={poolData} />
              ) : (
                <Center>
                  <Text>Something went wrong, Try again later</Text>
                </Center>
              )}
            </CardBox>
            <CardBox overflowX="auto" width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                  <Skeleton minW={'100%'} />
                </VStack>
              ) : poolData ? (
                <YourSupplies poolData={poolData} />
              ) : (
                <Center>
                  <Text>Something went wrong, Try again later</Text>
                </Center>
              )}
            </CardBox>
          </Flex>
          <Flex direction={{ base: 'column', md: 'row' }} gap={'20px'}>
            <CardBox mt={{ base: '24px' }} overflowX="auto" width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                  <Skeleton minW={'100%'} />
                </VStack>
              ) : poolData ? (
                <AssetsToSupply poolData={poolData} />
              ) : (
                <Center>
                  <Text>Something went wrong, Try again later</Text>
                </Center>
              )}
            </CardBox>
            <CardBox mt={{ base: '24px' }} overflowX="auto" width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                  <Skeleton minW={'100%'} />
                </VStack>
              ) : poolData ? (
                <AssetsToBorrow poolData={poolData} />
              ) : (
                <Center>
                  <Text>Something went wrong, Try again later</Text>
                </Center>
              )}
            </CardBox>
          </Flex>
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default PoolPage;
