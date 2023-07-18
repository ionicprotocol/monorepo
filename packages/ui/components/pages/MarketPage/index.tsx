import { Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

import AssetDetails from './AssetDetails';
import { AssetInfo } from './AssetInfo';
import { FundInfo } from './FundInfo';
import { InterestRateModel } from './InterestRateModel';
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

  const { data: poolData } = usePoolData(poolId, Number(chainId));
  const asset = poolData?.assets.find((asset) => asset.cToken === cToken);

  return (
    <>
      {asset && (
        <>
          <Head>
            <title key="title">{asset.underlyingName}</title>
          </Head>
          <PageTransitionLayout>
            <PageLayout>
              <Flex mb={'20px'}>
                <AssetInfo cToken={cToken} chainId={Number(chainId)} poolId={poolId} />
              </Flex>
              <Flex direction={{ base: 'column', md: 'row' }} gap={'20px'}>
                <Flex direction={{ base: 'column' }} flex={2} gap={'24px'}>
                  <AssetDetails asset={asset} chainId={Number(chainId)} />
                  <FundInfo asset={asset} chainId={Number(chainId)} />
                  <InterestRateModel asset={asset} chainId={Number(chainId)} />
                </Flex>
                <Flex display={'block'} flex={1}>
                  <YourInfo />
                </Flex>
              </Flex>
            </PageLayout>
          </PageTransitionLayout>
        </>
      )}
    </>
  );
});

export default MarketPage;
