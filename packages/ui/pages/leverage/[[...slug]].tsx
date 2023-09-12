import { utils } from 'ethers';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import LeveragePageComp from '@ui/components/pages/LeveragePageOld/index';
import { config } from '@ui/config/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const forgeAddress = ctx.params && ctx.params.slug ? ctx.params.slug[0] : '';

  return { props: { forgeAddress } };
};

const LeveragePage = ({ forgeAddress }: { forgeAddress: string }) => {
  const { setGlobalLoading, setAddress, address } = useMultiIonic();

  useEffect(() => {
    if (
      (!config.productDomain || !window.location.hostname.includes(config.productDomain)) &&
      forgeAddress &&
      utils.isAddress(forgeAddress) &&
      forgeAddress !== address
    ) {
      setAddress(utils.getAddress(forgeAddress));
    }
  }, [forgeAddress, setAddress, address]);

  useEffect(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  return (
    <>
      <Head>
        <title key="title">Leverage</title>
      </Head>
      <LeveragePageComp />
    </>
  );
};

export default LeveragePage;
