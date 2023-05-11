import Head from 'next/head';
import { useEffect } from 'react';

import LeveragePageComp from '@ui/components/pages/LeveragePage/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export async function getInitialProps() {
  return {};
}

const LeveragePage = () => {
  const { setGlobalLoading } = useMultiMidas();

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
