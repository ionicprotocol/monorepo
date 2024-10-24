'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// import { useEffect, useState } from 'react';
// import { formatEther, formatUnits } from 'viem';
import { base, mode } from 'viem/chains';
// import { useReadContract } from 'wagmi';

// import { BaseContractABI } from '@ui/constants/baselp';
import { BaseSugarAddress } from '@ui/constants/baselp';
import { pools } from '@ui/constants/index';
import { ModeSugarAddress } from '@ui/constants/lp';
import useSugarAPR from '@ui/hooks/useSugarAPR';
import { useTvl } from '@ui/hooks/useTvl';
import type { EarnRow, IRewards } from '@ui/utils/earnUtils';

// type EarnRowsParams = {
//   rows: EarnRow[];
// };
export default function EarnRows({
  apr,
  asset,
  network,
  protocol,
  tvlpool,
  tvl,
  link,
  poolChain,
  rewards,
  live,
  img,
  strategy
  // getTvl,
  // getApr,
}: EarnRow) {
  // const [tvlValue, setTvlValue] = useState();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ?? mode.id;
  const { data: tvlval } = useTvl({
    poolAddress: tvlpool as `0x${string}`,
    poolChainId: poolChain,
    assets: asset
  });
  // console.log(rewards);

  const totaltvl = tvlval?.reduce((acc, tvl) => acc + Number(tvl), 0) ?? 0;
  return (
    <>
      <div className=" w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 md:px-3 px-3 gap-x-1 md:grid grid-cols-13  py-4 text-sm text-white md:text-center items-center relative flex flex-col ">
        <div className="col-span-2 w-full flex justify-between md:justify-center  md:gap-x-2 gap-x-1 mb-1.5 ">
          <span className="text-white/40 font-semibold text-[11px] text-center md:hidden">
            ASSET
          </span>
          <div className={` flex ml-auto md:ml-0 `}>
            {asset.map((coin: string, idx: number) => (
              <img
                alt="logos"
                className={` w-5 h-5  top-0 left-0 ${
                  idx !== 0 && ' -translate-x-1'
                } `}
                key={idx}
                src={`/img/symbols/32/color/${coin}.png`}
              />
            ))}
          </div>
          <div>
            {asset.map((val: string, idx: number) => (
              <span
                className="text-center text-[11px] lg:text-sm"
                key={idx}
              >
                {idx !== 0 && '/'}
                {val}
              </span>
            ))}
          </div>
          {/* <OverlayingAssetImg /> */}
        </div>
        <p className="col-span-2 w-full flex justify-between md:justify-center gap-x-2 mb-1.5 ">
          <span className="text-white/40 font-semibold text-[11px] text-center md:hidden">
            PROTOCOL
          </span>
          <span
            className={`flex items-center justify-center gap-1 text-[11px] lg:text-sm`}
          >
            <img
              alt="logos"
              className={` w-4 h-4  md:mx-auto ml-auto top-0 left-0 inline-block `}
              src={img}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '/img/assets/info.png';
              }}
            />
            {protocol}
          </span>
        </p>
        <p className="col-span-2 w-full flex justify-between md:justify-center gap-x-2 mb-1.5 ">
          <span className="text-white/40 font-semibold text-[11px] text-center md:hidden">
            Strategy
          </span>
          <span
            className={`flex items-center justify-center gap-1 text-[11px] lg:text-sm`}
          >
            {strategy}
          </span>
        </p>
        <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2 mb-1.5">
          <span className="text-white/40 font-semibold text-[11px] text-center md:hidden">
            NETWORK
          </span>
          <img
            alt="logos"
            className={` w-5 h-5  md:mx-auto ml-auto top-0 left-0 `}
            src={`/img/logo/${network}.png`}
          />
        </div>
        <div className="popover-container relative flex md:flex-col items-center w-full  cursor-pointer mb-1.5 col-span-2">
          <div className=" w-max flex  md:justify-center gap-x-2">
            <span className="text-white/40 font-semibold text-[11px] text-center md:hidden">
              APR
            </span>
          </div>
          <span
            className={`w-max md:mb-1 ml-auto md:ml-0 text-center text-[11px] lg:text-sm  md:px-2.5 px-1`}
          >
            {apr && Number(apr) > 0 ? apr : '∞'}%
          </span>
          <span
            className={`${pools[+chain].text} ${pools[+chain].bg} rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center  md:px-2.5 px-1`}
          >
            + POINTS <i className="popover-hint">i</i>
          </span>
          {/* {rewards[poolChain]?.turtle && (
            <a
              className={`${pools[+chain].text} bg-accent rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center  md:px-2.5 px-1`}
              href="https://turtle.club/dashboard/?ref=IONIC"
              target="_blank"
            >
              + TURTLE{' '}
              <img
                alt="external-link"
                className={`w-3 h-3 inline-block`}
                src="https://img.icons8.com/material-outlined/24/external-link.png"
              />
            </a>
          )} */}
          <EarnPopup
            apr={apr}
            rewards={rewards}
            poolChain={poolChain}
          />
        </div>
        <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2 mb-2 text-[11px] lg:text-sm ">
          <span className="text-white/40 text-xs font-semibold md:hidden">
            TVL
          </span>
          $
          {tvl > 0
            ? tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : totaltvl === 0
              ? '-'
              : totaltvl.toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })}
        </div>
        <div className="col-span-1"> </div>
        <Link
          className={`col-span-2 w-full text-xs ${live ? 'bg-accent' : 'bg-accent/50'} text-darkone rounded-md py-1.5 px-3 font-semibold cursor-pointer mx-auto flex items-center justify-center gap-1.5`}
          href={link}
          target="_blank"
        >
          <span>{live ? 'DEPOSIT' : 'Coming Soon'}</span>
          <img
            alt="external-link"
            className={`w-3 h-3`}
            src="https://img.icons8.com/material-outlined/24/external-link.png"
          />
        </Link>
      </div>
    </>
  );
}

export const EarnPopup = ({
  apr,
  rewards,
  poolChain
}: {
  apr: number;
  rewards: Record<number, IRewards>;
  poolChain: number;
}) => {
  const ION_POOL_INDEX = 1489n;
  const ION_WETH_POOL_INDEX = 6n;
  const ION_MODE_POOL_INDEX = 26n;
  const selectedToken = rewards[poolChain]?.velo as 'eth' | 'mode' | 'weth';

  const veloApr = useSugarAPR({
    sugarAddress: ModeSugarAddress,
    poolIndex:
      selectedToken === 'mode' ? ION_MODE_POOL_INDEX : ION_WETH_POOL_INDEX,
    chainId: mode.id,
    selectedToken,
    isMode: true
  });

  const aeroApr = useSugarAPR({
    sugarAddress: BaseSugarAddress,
    poolIndex: ION_POOL_INDEX,
    chainId: base.id
  });

  const shouldShow =
    rewards[poolChain]?.velo ||
    rewards[poolChain]?.aero ||
    rewards[poolChain]?.peaks ||
    Number(apr) > 0;
  return (
    <div
      className={`font-bold popover absolute w-[190px] top-full p-2 mt-1 border border-mode rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap flex flex-col gap-4 ${shouldShow ? '' : 'hidden'}`}
    >
      {apr && Number(apr) > 0 ? 'Base APR: ' + apr + '%' : ''}
      {/* <div className="flex">
          <img
            alt=""
            className="size-4 rounded mr-1"
            src="/img/ionic-sq.png"
          />{' '}
          + {rewards[poolChain]?.points?.ionic}x Ionic Points
        </div> */}
      {rewards[poolChain]?.velo && (
        <div className="flex">
          <img
            alt=""
            className="size-4 rounded mr-1"
            src="/img/symbols/32/color/velo.png"
          />{' '}
          {veloApr?.apr ?? '0'} Velodrome APR
        </div>
      )}
      {rewards[poolChain]?.aero && (
        <div className="flex">
          <img
            alt=""
            className="size-4 rounded mr-1"
            src="/img/symbols/32/color/aero.png"
          />{' '}
          {aeroApr?.apr ?? '0'} Aerodrome APR
        </div>
      )}
      {/* <div className="flex">
          <img
            alt=""
            className="size-4 rounded mr-1"
            src="/images/turtle-ionic.png"
          />{' '}
          + {rewards[poolChain]?.points?.turtle}x Turtle Ionic Points
        </div> */}
      {rewards[poolChain]?.peaks && (
        <div className="flex">
          <img
            alt=""
            className="size-4 rounded mr-1 inline-block"
            src="/img/symbols/32/color/peaks.png"
          />
          + Peaks Points
        </div>
      )}
    </div>
  );
};
