import { useRari } from '@ui/context/RariContext';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolCreate from '@ui/components/pages/Fuse/FusePoolCreatePage';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const FusePoolCreatePage: NextPage = () => {
  const { setLoading } = useRari();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <Head>
        <title>Create Pool</title>
      </Head>
      <FusePoolCreate />
    </>
  );
};

export default FusePoolCreatePage;
