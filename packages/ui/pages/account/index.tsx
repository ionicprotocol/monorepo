import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import AccountPageComp from '@ui/components/pages/AccountPage/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

const AccountPage: NextPage = () => {
  const { setGlobalLoading } = useMultiMidas();
  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Account</title>
      </Head>
      <AccountPageComp />
    </>
  );
};

export default AccountPage;
