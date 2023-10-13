import Head from 'next/head';
import { useEffect } from 'react';

import LeveragePageComp from '@ui/components/pages/LeveragePage/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

const LeveragePage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Leverage</title>
      </Head>
      <LeveragePageComp />
    </>
  );
};

export default LeveragePage;
