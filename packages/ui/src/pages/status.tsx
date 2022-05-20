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

const StatusPage: NextPage = () => {
  return (
    <>
      <Head>Midas Status</Head>
      <h2>Midas Status</h2>
      <p>Everything working as expected</p>
    </>
  );
};

export default StatusPage;
