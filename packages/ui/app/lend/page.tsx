'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// import InstantSupply from '../_components/markets/InstantSupply';

const InstantSupply = dynamic(
  () => import('../_components/markets/InstantSupply'),
  {
    ssr: false
  }
);

export default function Lend() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <main className={``}>
      <div className="w-full flex items-center justify-center min-h-screen transition-all duration-200 ease-linear bg-black dark:bg-black">
        <h1 onClick={() => setOpen(true)}>Lend me</h1>
        <InstantSupply
          open={open}
          close={() => setOpen(false)}
        />
      </div>
    </main>
  );
}
