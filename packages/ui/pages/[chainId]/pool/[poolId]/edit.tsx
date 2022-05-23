import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolEditPage from '@ui/components/pages/Fuse/FusePoolEditPage';
import { useRari } from '@ui/context/RariContext';

const FusePoolEditPageNext: NextPage = () => {
  const { setLoading } = useRari();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <Head>
        <title key="title">Edit Pool</title>
      </Head>
      <FusePoolEditPage />
    </>
  );
};

export default FusePoolEditPageNext;
