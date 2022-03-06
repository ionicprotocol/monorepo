import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import FusePoolEditPage from '@components/pages/Fuse/FusePoolEditPage';
import { useRari } from '@context/RariContext';

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

  return <FusePoolEditPage />;
};

export default FusePoolEditPageNext;
