import { Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import PageLayout from '../Layout/PageLayout';

import { LendSupply } from './Supply';

import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { usePoolData } from '@ui/hooks/usePoolData';

export const LendDetailPage = () => {
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
          <Flex direction={{ base: 'column' }} gap={'20px'}>
            <CardBox width="100%">
              {isPoolDataLoading ? (
                <VStack>
                  <Skeleton minW={'80px'} />
                </VStack>
              ) : poolData ? (
                <LendSupply poolData={poolData} />
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
                <LendSupply poolData={poolData} />
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
