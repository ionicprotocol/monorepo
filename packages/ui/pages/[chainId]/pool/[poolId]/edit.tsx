import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolEditPage from '@ui/components/pages/EditPoolPage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

const FusePoolEditPageNext: NextPage = () => {
  const { setGlobalLoading } = useMultiIonic();
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
