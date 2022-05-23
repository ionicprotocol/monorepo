import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolPage from '@ui/components/pages/Fuse/FusePoolPage';
import { useRari } from '@ui/context/RariContext';

const FusePage: NextPage = () => {
  const { setLoading } = useRari();
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
