import { Flex } from '@chakra-ui/react';
import Head from 'next/head';

import { Borrows } from './Borrows';
import { Claimable } from './Claimable';
import { LendingStrategy } from './LendingStrategy';
import { LendingVaults } from './LendingVaults';
import { NetApr } from './NetApr';
import { NetAssetValue } from './NetAssetValue';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

export const Dashboard = () => {
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
