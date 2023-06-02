import Head from 'next/head';
import { memo } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import LeverageHero from '@ui/components/pages/LeveragePage/LeverageHero/index';
import { LeverageList } from '@ui/components/pages/LeveragePage/LeverageList/index';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';

const LeveragePage = memo(() => {
  return (
    <>
      <Head>
        <title key="title">Leverage</title>
      </Head>
      <PageTransitionLayout>
        <FusePageLayout>
          <LeverageHero />
          <LeverageList />
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default LeveragePage;
