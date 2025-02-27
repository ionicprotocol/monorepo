'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import ResultHandler from '../components/ResultHandler';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/market?chain=8453&pool=0');
  }, [router]);
  return (
    <div className={`flex items-center justify-center w-full min-h-[70vh]`}>
      <ResultHandler isLoading={true}>Home</ResultHandler>
    </div>
  );
};

export default Home;
