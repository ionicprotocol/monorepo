'use client';

import { useEffect, useState } from 'react';

import EarnRows, { type EarnRow } from '../_components/earn/EarnRows';

const earnOpps: EarnRow[] = [
  {
    apr: 0,
    asset: ['ION', 'WETH'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    link: 'https://velodrome.finance/deposit?token0=0x18470019bF0E94611f15852F7e93cf5D65BC34CA&token1=0x4200000000000000000000000000000000000006&type=-1',
    network: 'mode',
    protocol: 'Velodrome',
    tvl: 0
  },
  {
    apr: 0,
    asset: ['ionUSDC', 'ionUSDT'],
    getApr: async () => {
      try {
        const response = await fetch(
          'https://api.steer.finance/pool/fee-apr?address=0x17694615caba46ef765a3673fa488e04332b522a&chain=34443&interval=604800'
        );
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const val = await response.json();
        return val?.apr ?? 0;
      } catch (err) {
        console.error(err);
      }
    },
    getTvl: async () => {
      try {
        const response = await fetch(
          'https://api.steer.finance/pool/lp/value?chain=34443&address=0x17694615caba46ef765a3673fa488e04332b522a'
        );
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const val = await response.json();
        return val?.tvl ?? 0;
      } catch (err) {
        console.error(err);
      }
    },
    link: 'https://app.steer.finance/vault/0x17694615caba46ef765a3673fa488e04332b522a/34443',
    network: 'mode',
    protocol: 'Steer',
    tvl: 0
  }
];

export default function Earn() {
  const [rows, setRows] = useState<EarnRow[]>(earnOpps);

  useEffect(() => {
    const populateVals = async () => {
      await Promise.all(
        rows.map(async (row) => {
          row.apr = await row.getApr();
          row.tvl = await row.getTvl();
        })
      );
      setRows([...rows]);
    };
    populateVals();
  }, [rows]);
  return (
    <>
      <h1 className="mb-4 text-center text-white/80 ">
        ✨ Earn extra yield using the opportunities listed to make use of your
        Ionic deposits! ✨
      </h1>
      <div className="flex flex-col items-start justify-start px-6 rounded-2xl bg-graylite dark:bg-grayone w-full  ">
        <div
          className={`w-full md:grid grid-cols-13  my-3 px-2  gap-x-1  text-white/40 font-semibold lg:text-center items-start  text-xs hidden  `}
        >
          <h1 className="col-span-3 ">ASSETS</h1>
          <h1 className="col-span-2">PROTOCOL</h1>
          <h1 className="col-span-1">NETWORK</h1>
          <h1 className="col-span-1">APR</h1>
          <h1 className="col-span-1">TVL</h1>
          <h1 className="col-span-3"> </h1>
          <h1 className="col-span-2"> </h1>
        </div>

        {/* this will get mapped out in future with the possible api data structure mentioned below */}
        <EarnRows rows={rows} />
      </div>
    </>
  );
}

/*
 Attribute can be added to EarnRows --------
  asset :  [ionUSDC, ionUSDT] - default //name of the asset  should be same as image name
  protocol : 'Balancer' (default)
  Network : "Imgname same to network" (default - mode)
  apr : ''  def- 0
  tvl : ''   def- 0
-------

*/
