import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolsPage from '@ui/components/pages/Fuse/FusePoolsPage';
import Terms from '@ui/components/pages/Fuse/Modals/Terms';
import { useMidas } from '@ui/context/MidasContext';

export async function getInitialProps() {
  return {};
}

const FusePage: NextPage = () => {
  const { setLoading } = useMidas();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <Head>
        <title>Midas Capital</title>
      </Head>
      <FusePoolsPage />
      <Terms />
    </>
  );
};

export default FusePage;
