import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import PoolCreate from '@ui/components/pages/CreatePoolPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const PoolCreatePage: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();
  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title>Create Pool</title>
      </Head>
      <PoolCreate />
    </>
  );
};

export default PoolCreatePage;
