import Head from 'next/head';
import { useEffect } from 'react';

import VaultsPage from '@ui/components/pages/VaultsPage/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const VaultPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Vaults</title>
      </Head>
      <VaultsPage />
    </>
  );
};

export default VaultPage;
