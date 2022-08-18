import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolPage from '@ui/components/pages/Fuse/FusePoolPage';
import { useMidas } from '@ui/context/MidasContext';

const FusePage: NextPage = () => {
  const { setLoading } = useMidas();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <Head>
        <title key="title">Pool Details</title>
      </Head>
      <FusePoolPage />
    </>
  );
};

export default FusePage;
