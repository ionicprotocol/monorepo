import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

const FusePoolCreate = dynamic(() => import('@ui/components/pages/Fuse/FusePoolCreatePage'), {
  ssr: false,
});

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
