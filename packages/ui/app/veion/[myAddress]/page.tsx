'use client';

// import { useEffect, useState } from 'react';

interface IProp {
  params: { myAddress: string };
}

export default function MyVeIon({ params }: IProp) {
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await fetch(
  //       'https://api.blockchair.com/bitcoin/dashboards/address/' + address
  //     );
  //     const data = await response.json();
  //     setBalance(data.data.balance);
  //   };
  //   fetchData();
  // }, [address]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">my Address</h1>
        <h1 className="text-4xl font-bold">{params.myAddress}</h1>
      </div>
    </div>
  );
}
