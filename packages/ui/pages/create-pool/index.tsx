import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolCreate from '@ui/components/pages/Fuse/FusePoolCreatePage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const FusePoolCreatePage: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();
  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title>Create Pool</title>
      </Head>
      <FusePoolCreate />
    </>
  );
};

export default FusePoolCreatePage;
