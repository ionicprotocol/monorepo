import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolCreate from '@ui/components/pages/Fuse/FusePoolCreatePage';
import { useRari } from '@ui/context/RariContext';

const FusePoolCreatePage: NextPage = () => {
  const { setLoading } = useRari();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

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
