import Head from 'next/head';
import { useEffect } from 'react';

import { LendPage as LendPageComp } from '@ui/components/pages/LendPage/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const LendPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Lend</title>
      </Head>
      <LendPageComp />
    </>
  );
};

export default LendPage;
