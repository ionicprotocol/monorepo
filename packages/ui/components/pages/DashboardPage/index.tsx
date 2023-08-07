import { Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Borrows } from './Borrows';
import { Claimable } from './Claimable';
import { LendingStrategy } from './LendingStrategy';
import { LendingVaults } from './LendingVaults';
import { NetApr } from './NetApr';
import { NetAssetValue } from './NetAssetValue';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { usePoolData } from '@ui/hooks/usePoolData';

export const Dashboard = () => {
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
      <Head>
        <title key="title">Dashboard</title>
      </Head>
      <PageTransitionLayout>
        <PageLayout>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={'20px'} mb={'20px'}>
            <Flex flex={2}>
              <NetAssetValue />
            </Flex>
            <Flex flex={2}>
              <NetApr />
            </Flex>
            <Flex flex={1}>
              <Claimable />
            </Flex>
          </Flex>
          <Flex mb={'20px'}>
            <Borrows />
          </Flex>
          <Flex mb={'20px'}>
            <LendingVaults />
          </Flex>
          <Flex mb={'20px'}>
            <LendingStrategy />
          </Flex>
        </PageLayout>
      </PageTransitionLayout>
    </>
  );
};
