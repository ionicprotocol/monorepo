import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const FusePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Midas Capital</title>
      </Head>
    </>
  );
};

export default FusePage;
