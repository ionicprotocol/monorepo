import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect } from 'react';

import FusePoolEditPage from '@ui/components/pages/Fuse/FusePoolEditPage';
import { useRari } from '@ui/context/RariContext';

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

const FusePoolEditPageNext: NextPage = () => {
  const { setLoading } = useRari();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <Head>
        <title key="title">Edit Pool</title>
      </Head>
      <FusePoolEditPage />
    </>
  );
};

export default FusePoolEditPageNext;
