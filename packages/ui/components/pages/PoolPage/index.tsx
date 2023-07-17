import { Center, Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import { AssetsToBorrow } from '@ui/components/pages/PoolPage/AssetsToBorrow/index';
import { AssetsToSupply } from '@ui/components/pages/PoolPage/AssetsToSupply/index';
import PoolDetails from '@ui/components/pages/PoolPage/PoolDetails';
import { YourBorrows } from '@ui/components/pages/PoolPage/YourBorrows/index';
import { YourSupplies } from '@ui/components/pages/PoolPage/YourSupplies/index';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { usePoolData } from '@ui/hooks/usePoolData';

const PoolPage = memo(() => {
  const router = useRouter();
  const poolId = useMemo(
    () => (router.isReady ? (router.query.poolId as string) : ''),
    [router.isReady, router.query.poolId]
  );
  const chainId = useMemo(
    () => (router.isReady ? (router.query.chainId as string) : ''),
    [router.isReady, router.query.chainId]
  );
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId, Number(chainId));

  return (
    <>
      {poolData && (
        <Head>
          <title key="title">{poolData.name}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <PageLayout>
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
                <YourBorrows poolData={poolData} />
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
        </PageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default PoolPage;
