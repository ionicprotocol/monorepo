import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import PoolEditPage from '@ui/components/pages/EditPoolPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

const PoolEditPageNext: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();
  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Edit Pool</title>
      </Head>
      <PoolEditPage />
    </>
  );
};

export default PoolEditPageNext;
