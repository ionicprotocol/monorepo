'use client';

// import { useEffect, useState } from 'react';

interface IProp {
  params: { myAddress: string };
}

export default function MyVeIon({ params }: IProp) {
  return (
    <div className="w-full flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">my Address</h1>
        <h1 className="text-4xl font-bold">{params.myAddress}</h1>
      </div>
    </div>
  );
}
