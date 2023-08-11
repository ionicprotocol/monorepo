import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Flex,
  HStack,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import PageLayout from '../Layout/PageLayout';

import { AssetsList } from './AssetsList';
import { LendSupply } from './Supply';
import { LendWithdraw } from './Withdraw';

import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { usePoolData } from '@ui/hooks/usePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const LendDetailPage = () => {
  const [selectedAsset, setSelectedAsset] = useState<MarketData>();
  const router = useRouter();
  const { setGlobalLoading } = useMultiIonic();
  const poolId = useMemo(
    () => (router.isReady ? (router.query.poolId as string) : ''),
    [router.isReady, router.query.poolId]
  );
  const chainId = useMemo(
    () => (router.isReady ? (router.query.chainId as string) : ''),
    [router.isReady, router.query.chainId]
  );
  const { data: poolData, isLoading: isPoolDataLoading } = usePoolData(poolId, Number(chainId));

  useEffect(() => {
    if (poolData && poolData.assets.length > 0) {
      setSelectedAsset(poolData.assets[0]);
    } else {
      setSelectedAsset(undefined);
    }
  }, [poolData]);

  return (
    <>
      {poolData && (
        <Head>
          <title key="title">{poolData.name}</title>
        </Head>
      )}
      <PageTransitionLayout>
        <PageLayout>
          <Flex direction={{ base: 'column' }} gap={'20px'}>
            <CardBox width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                </VStack>
              ) : poolData && selectedAsset ? (
                <Tabs>
                  <HStack mb={'20px'} spacing={4}>
                    <ArrowBackIcon
                      cursor="pointer"
                      fontSize="2xl"
                      fontWeight="extrabold"
                      onClick={() => {
                        setGlobalLoading(true);
                        router.back();
                      }}
                    />
                    <TabList m={0}>
                      <Tab>Supply {selectedAsset.underlyingSymbol}</Tab>
                      <Tab>Withdraw {selectedAsset.underlyingSymbol}</Tab>
                    </TabList>
                  </HStack>
                  <TabPanels>
                    <TabPanel p={0}>
                      <LendSupply
                        poolData={poolData}
                        selectedAsset={selectedAsset}
                        setSelectedAsset={setSelectedAsset}
                      />
                    </TabPanel>
                    <TabPanel p={0}>
                      <LendWithdraw
                        poolData={poolData}
                        selectedAsset={selectedAsset}
                        setSelectedAsset={setSelectedAsset}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              ) : (
                <Center>
                  <Text>Something went wrong, Try again later</Text>
                </Center>
              )}
            </CardBox>
            <CardBox width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                </VStack>
              ) : poolData ? (
                <AssetsList poolData={poolData} />
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
};
