import { Center, Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

import { AssetInfo } from './AssetInfo';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { AssetsToBorrow } from '@ui/components/pages/PoolPage/AssetsToBorrow/index';
import { AssetsToSupply } from '@ui/components/pages/PoolPage/AssetsToSupply/index';
import { YourBorrows } from '@ui/components/pages/PoolPage/YourBorrows/index';
import { YourSupplies } from '@ui/components/pages/PoolPage/YourSupplies/index';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

const MarketPage = memo(() => {
  const router = useRouter();
  const poolId = useMemo(
    () => (router.isReady ? (router.query.poolId as string) : ''),
    [router.isReady, router.query.poolId]
  );
  const chainId = useMemo(
    () => (router.isReady ? (router.query.chainId as string) : ''),
    [router.isReady, router.query.chainId]
  );
  const cToken = useMemo(
    () => (router.isReady ? (router.query.cToken as string) : ''),
    [router.isReady, router.query.cToken]
  );

  const { data: poolData, isLoading: isPoolDataLoading } = useFusePoolData(poolId, Number(chainId));
  const asset = poolData?.assets.find((asset) => asset.cToken === cToken);

  return (
    <>
      {asset && (
        <Head>
          <title key="title">{asset.underlyingName}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <FusePageLayout>
          <Flex mb={'20px'}>
            <AssetInfo cToken={cToken} chainId={Number(chainId)} poolId={poolId} />
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
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default MarketPage;
