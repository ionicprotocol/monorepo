import { Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

import AssetDetails from './AssetDetails';
import { AssetInfo } from './AssetInfo';
import { FundInfo } from './FundInfo';
import { UtilizationRate } from './UtilizationRate';
import { YourInfo } from './YourInfo';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { usePoolData } from '@ui/hooks/usePoolData';

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

  const { data: poolData, isLoading } = usePoolData(poolId, Number(chainId));
  const asset = poolData?.assets.find((asset) => asset.cToken === cToken);

  return (
    <>
      <Head>
        <title key="title">{asset ? asset.underlyingName : 'Market Details'}</title>
      </Head>
      <PageTransitionLayout>
        <PageLayout>
          <Flex mb={'20px'}>
            <AssetInfo cToken={cToken} chainId={Number(chainId)} poolId={poolId} />
          </Flex>
          <Flex direction={{ base: 'column', md: 'row' }} gap={'20px'}>
            <Flex direction={{ base: 'column' }} flex={2} gap={'24px'}>
              <AssetDetails asset={asset} chainId={Number(chainId)} isLoading={isLoading} />
              <FundInfo asset={asset} chainId={Number(chainId)} />
              <UtilizationRate asset={asset} chainId={Number(chainId)} isLoading={isLoading} />
            </Flex>
            <Flex display={'block'} flex={1}>
              <YourInfo
                asset={asset}
                assets={poolData?.assets}
                chainId={Number(chainId)}
                comptroller={poolData?.comptroller}
                isLoading={isLoading}
                poolId={poolId}
              />
            </Flex>
          </Flex>
        </PageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default MarketPage;
