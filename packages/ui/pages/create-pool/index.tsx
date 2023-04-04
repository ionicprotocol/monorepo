import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolCreate from '@ui/components/pages/Fuse/FusePoolCreatePage';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export async function getInitialProps() {
  return {};
}

const FusePoolCreatePage: NextPage = () => {
  const { setGlobalLoading } = useMultiMidas();
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
