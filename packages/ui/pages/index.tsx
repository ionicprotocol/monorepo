import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import PoolsPage from '@ui/components/pages/PoolsPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const IonicPage: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();

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

export default IonicPage;
