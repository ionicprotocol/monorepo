'use client';

import { useEffect, useState } from 'react';

import EarnRows from '../_components/earn/EarnRows';

import type { EarnRow } from '@ui/utils/earnUtils';
import { earnOpps } from '@ui/utils/earnUtils';

export default function Earn() {
  const [rows, setRows] = useState<EarnRow[]>(earnOpps);

  useEffect(() => {
    const populateVals = async () => {
      await Promise.all(
        rows.map(async (row) => {
          //@ts-ignore
          row.apr = await row.getApr();
          //@ts-ignore
          row.tvl = await row.getTvl();
        })
      );
      setRows([...rows]);
    };
    populateVals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <h1 className="mb-4 text-center text-white/80 ">
        ✨ Earn extra yield using the opportunities listed to make use of your
        Ionic deposits! ✨
      </h1>
      <div className="flex flex-col items-start justify-start md:px-3 rounded-2xl bg-graylite dark:bg-grayone w-full  ">
        <div
          className={`w-full md:grid grid-cols-13  my-3  px-2  gap-x-1  text-white/40 font-semibold md:text-center items-start  text-xs hidden  `}
        >
          <h1 className="col-span-2 ">ASSETS</h1>
          <h1 className="col-span-2">PROTOCOL</h1>
          <h1 className="col-span-2">STRATEGY</h1>
          <h1 className="col-span-1">NETWORK</h1>
          <h1 className="col-span-2">APR</h1>
          <h1 className="col-span-1">TVL</h1>
          <h1 className="col-span-1"> </h1>
          <h1 className="col-span-1"> </h1>
        </div>

        {/* this will get mapped out in future with the possible api data structure mentioned below */}
        {rows.map(
          (
            {
              apr,
              asset,
              network,
              protocol,
              tvl,
              link,
              poolChain,
              tvlpool,
              rewards,
              live,
              img,
              strategy
            },
            idx
          ) => (
            <EarnRows
              apr={apr}
              asset={asset}
              network={network}
              protocol={protocol}
              tvl={tvl}
              tvlpool={tvlpool}
              poolChain={poolChain}
              link={link}
              key={idx}
              rewards={rewards}
              live={live}
              img={img}
              strategy={strategy}
            />
          )
        )}
        {/* <CommingSoon
          linktoProtocol={'https://www.tren.finance'}
          additionalText={'Tren Finance'}
        />
        <CommingSoon
          linktoProtocol={'https://peapods.finance'}
          additionalText={'Peapods Finance'}
        /> */}
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
