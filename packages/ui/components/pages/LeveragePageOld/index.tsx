import Head from 'next/head';
import { memo } from 'react';

import PageLayout from '@ui/components/pages/Layout/PageLayout';
import LeverageHero from '@ui/components/pages/LeveragePageOld/LeverageHero/index';
import { LeverageList } from '@ui/components/pages/LeveragePageOld/LeverageList/index';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const LeveragePage = memo(() => {
  return (
    <>
      <Head>
        <title key="title">Leverage</title>
      </Head>
      <PageTransitionLayout>
        <PageLayout>
          <LeverageHero />
          <LeverageList />
        </PageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default LeveragePage;
