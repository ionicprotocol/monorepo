import Head from 'next/head';
import { useEffect } from 'react';

import { Dashboard } from '@ui/components/pages/DashboardPage/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export async function getInitialProps() {
  return {};
}

const DashboardPage = () => {
  const { setGlobalLoading } = useMultiIonic();

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Dashboard</title>
      </Head>
      <Dashboard />
    </>
  );
};

export default DashboardPage;
