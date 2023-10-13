import Head from 'next/head';
import { useEffect } from 'react';

import NewPositionComp from '@ui/components/pages/LeveragePage/NewPosition';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

const LeveragePage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">New Position</title>
      </Head>
      <NewPositionComp />
    </>
  );
};

export default LeveragePage;
