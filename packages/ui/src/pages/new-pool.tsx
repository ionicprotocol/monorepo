import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import FusePoolCreate from '@components/pages/Fuse/FusePoolCreatePage';
import { useRari } from '@context/RariContext';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const FusePoolCreatePage: NextPage = () => {
  const { setLoading } = useRari();
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return <FusePoolCreate />;
};

export default FusePoolCreatePage;
