import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import PoolsPage from '@ui/components/pages/PoolsPage';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export async function getInitialProps() {
  return {};
}

const FusePage: NextPage = () => {
  const { setGlobalLoading } = useMultiMidas();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title>Ionic Protocol</title>
      </Head>
      <PoolsPage />
    </>
  );
};

export default FusePage;
