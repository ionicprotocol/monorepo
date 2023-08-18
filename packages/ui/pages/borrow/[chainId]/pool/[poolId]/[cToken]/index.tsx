import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import MarketPageComp from '@ui/components/pages/MarketPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

const MarketPage: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Market Details</title>
      </Head>
      <MarketPageComp />
    </>
  );
};

export default MarketPage;
