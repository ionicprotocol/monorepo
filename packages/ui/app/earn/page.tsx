'use client';

import { useEffect, useState } from 'react';
import { base, mode } from 'viem/chains';

import CommingSoon from '../_components/earn/CommingSoon';
import EarnRows, { type EarnRow } from '../_components/earn/EarnRows';

const earnOpps: EarnRow[] = [
  {
    apr: 0,
    asset: ['ION', 'WETH'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    rewards: {
      [mode.id]: {
        peaks: false
      }
    },
    link: 'https://app.ionic.money/stake?chain=34443&token=weth',
    network: 'mode',
    poolChain: mode.id,
    protocol: 'Velodrome',
    tvl: 0,
    tvlpool: '0xC6A394952c097004F83d2dfB61715d245A38735a'
  },
  {
    apr: 0,
    asset: ['ION', 'WETH'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    rewards: {
      [base.id]: {
        peaks: false
      }
    },
    link: 'https://app.ionic.money/stake?chain=8453',
    network: 'base',
    poolChain: base.id,
    protocol: 'Aerodrome Finance',
    tvl: 0,
    tvlpool: '0x0FAc819628a7F612AbAc1CaD939768058cc0170c'
  },
  {
    apr: 0,
    asset: ['ION', 'MODE'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    rewards: {
      [mode.id]: {
        peaks: false
      }
    },
    link: 'https://app.ionic.money/stake?chain=34443&token=mode',
    network: 'mode',
    poolChain: mode.id,
    protocol: 'Velodrome',
    tvl: 0,
    tvlpool: '0x690A74d2eC0175a69C0962B309E03021C0b5002E'
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
    rewards: {
      [mode.id]: {
        peaks: false
      }
    },
    link: 'https://app.steer.finance/vault/0x17694615caba46ef765a3673fa488e04332b522a/34443',
    network: 'mode',
    protocol: 'Steer',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDC'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    rewards: {
      [mode.id]: {
        peaks: true
      }
    },
    link: 'https://davos.xyz/app/loans/mint/?network=mode&token=ionUSDC',
    network: 'mode',
    protocol: 'Davos',
    tvl: 0,
    poolChain: mode.id
  },
  {
    apr: 0,
    asset: ['ionUSDT'],
    getApr: () => Promise.resolve(0),
    getTvl: () => Promise.resolve(0),
    rewards: {
      [mode.id]: {
        peaks: true
      }
    },
    link: 'https://davos.xyz/app/loans/mint/?network=mode&token=ionUSDT',
    network: 'mode',
    protocol: 'Davos',
    tvl: 0,
    poolChain: mode.id
  }
];

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
          <h1 className="col-span-3 ">ASSETS</h1>
          <h1 className="col-span-2">PROTOCOL</h1>
          <h1 className="col-span-2">NETWORK</h1>
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
              rewards
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
            />
          )
        )}
        <CommingSoon
          linktoProtocol={'https://www.tren.finance'}
          additionalText={'Tren Finance'}
        />
        <CommingSoon
          linktoProtocol={'https://peapods.finance'}
          additionalText={'Peapods Finance'}
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
