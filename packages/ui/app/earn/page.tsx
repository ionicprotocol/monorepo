'use client';

import { useEffect, useState } from 'react';

import EarnRows from '../_components/earn/EarnRows';

export default function Lend() {
  const [apr, setApr] = useState<number>(0);
  const [tvl, setTvl] = useState<number>(0);

  useEffect(() => {
    async function getApr() {
      try {
        const response = await fetch(
          'https://api.steer.finance/pool/fee-apr?address=0x17694615caba46ef765a3673fa488e04332b522a&chain=34443&interval=604800'
        );
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const val = await response.json();
        setApr(val?.apr);

        const tvlresponse = await fetch(
          'https://api.steer.finance/pool/lp/value?chain=34443&address=0x17694615caba46ef765a3673fa488e04332b522a'
        );
        if (!tvlresponse.ok) {
          throw new Error(`HTTP error: Status ${tvlresponse.status}`);
        }
        const tvlval = await tvlresponse.json();
        setTvl(tvlval?.tvl);
      } catch (err) {
        // console.log(err);
      }
    }
    getApr();
  }, []);
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
          <h1 className="col-span-3 "> ASSETS </h1>
          <h1 className="col-span-2"> PROTOCOL</h1>
          <h1 className="col-span-1"> NETWORK</h1>
          <h1 className="col-span-1"> APR</h1>
          <h1 className="col-span-1"> TVL</h1>
          <h1 className="col-span-3"> </h1>
          <h1 className="col-span-2"> </h1>
        </div>

        {/* this will get mapped out in future with the possible api data structure mentioned below */}
        <EarnRows
          apr={apr}
          tvl={tvl}
        />
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
