import { utils } from 'ethers';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import AccountPageComp from '@ui/components/pages/AccountPage/index';
import { config } from '@ui/config/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const forgeAddress = ctx.params && ctx.params.slug ? ctx.params.slug[0] : '';

  return { props: { forgeAddress } };
};

const AccountPage = ({ forgeAddress }: { forgeAddress: string }) => {
  const { setGlobalLoading, setAddress, address } = useMultiMidas();

  useEffect(() => {
    if (
      (!config.productDomain || !window.location.hostname.includes(config.productDomain)) &&
      forgeAddress &&
      utils.isAddress(forgeAddress) &&
      forgeAddress !== address
    ) {
      setAddress(forgeAddress);
    }
  }, [forgeAddress, setAddress, address]);

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
