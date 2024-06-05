'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import ResultHandler from './_components/ResultHandler';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/market?chain=34443&pool=0');
  }, [router]);
  return <ResultHandler isLoading={true}>Home</ResultHandler>;
};

export default Home;
