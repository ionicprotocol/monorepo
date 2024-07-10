'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import ResultHandler from './_components/ResultHandler';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/market?chain=34443&pool=0');
  }, [router]);
  return (
    <div className={`flex items-center justify-center w-full min-h-[70%]`}>
      <ResultHandler isLoading={true}>Home</ResultHandler>
    </div>
  );
};

export default Home;
