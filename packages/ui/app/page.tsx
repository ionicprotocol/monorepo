'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/market?chain=34443&pool=0');
  }, [router]);
  return <div>Home</div>;
};

export default Home;
