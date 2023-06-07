import Head from 'next/head';
import { useEffect } from 'react';

import VaultsPage from '@ui/components/pages/VaultsPage/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export async function getInitialProps() {
  return {};
}

const VaultPage = () => {
  const { setGlobalLoading } = useMultiMidas();

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
