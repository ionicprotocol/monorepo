import Head from 'next/head';
import { useEffect } from 'react';

import { BorrowPage as BorrowPageComp } from '@ui/components/pages/BorrowPage/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const BorrowPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Borrow</title>
      </Head>
      <BorrowPageComp />
    </>
  );
};

export default BorrowPage;
