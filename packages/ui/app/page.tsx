'use client';

import { useState } from 'react';
export default function Home() {
  const [isdark, setIsdark] = useState<boolean>(false);
  return (
    <main className={`${isdark ? 'dark ' : null}`}>
      <div className="w-full min-h-screen transition-all duration-200 ease-linear bg-black dark:bg-black">
        {/* <h1 onClick={()=>setIsdark(!isdark) }className={`text-red-500 text-3xl `}>toggle dark </h1> */}
      </div>
    </main>
  );
}
