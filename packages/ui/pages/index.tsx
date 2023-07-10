import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolsPage from '@ui/components/pages/Fuse/FusePoolsPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const FusePage: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title>Ionic Protocol</title>
      </Head>
      <FusePoolsPage />
    </>
  );
};

export default FusePage;
