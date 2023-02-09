import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolEditPage from '@ui/components/pages/EditPoolPage';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

const FusePoolEditPageNext: NextPage = () => {
  const { setGlobalLoading } = useMultiMidas();
  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

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
