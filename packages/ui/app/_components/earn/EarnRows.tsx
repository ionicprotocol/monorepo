'use client';

import Link from 'next/link';

interface IEarnRow {
  apr?: number | string;
  asset?: string[]; //name of the asset in uppercase array
  assetImg?: string; //or we can ommit this by naming the image name same to the asset name
  network?: string;
  protocol?: string;
  protocolImg?: string;
  tvl?: number;
}

export default function EarnRows({
  asset = ['ionUSDC', 'ionUSDT'],
  apr = 5,
  network = 'MODE',
  protocol = 'Steer',
  tvl = 1200
}: IEarnRow) {
  // const ;
  return (
    <div className=" w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl my-3 px-2 gap-x-1 md:grid  grid-cols-13  py-4 text-sm text-white lg:text-center items-center relative flex flex-col ">
      <div className="col-span-3 w-full flex justify-between md:justify-center  gap-x-2 ">
        <span className="text-white/40 text-xs font-semibold md:hidden">
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
              src={`/img/logo/${coin}.png`}
            />
          ))}
        </div>
        <div>
          {asset.map((val: string, idx: number) => (
            <span
              className="text-center"
              key={idx}
            >
              {idx !== 0 && '/'}
              {val}
            </span>
          ))}
        </div>
        {/* <OverlayingAssetImg /> */}
      </div>
      <p className="col-span-2 w-full flex justify-between md:justify-center gap-x-2 ">
        <span className="text-white/40 text-xs font-semibold md:hidden">
          PROTOCOL
        </span>
        {protocol}
      </p>
      <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2">
        <span className="text-white/40 text-xs font-semibold md:hidden">
          NETWORK
        </span>
        <img
          alt="logos"
          className={` w-5 h-5  md:mx-auto ml-auto top-0 left-0 `}
          src={`/img/logo/${network}.png`}
        />
      </div>
      <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2">
        <span className="text-white/40 text-xs font-semibold md:hidden">
          APR
        </span>
        {apr}%
      </div>
      <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2">
        <span className="text-white/40 text-xs font-semibold md:hidden">
          TVL
        </span>
        ${+tvl.toFixed(4)}
      </div>
      <div className="col-span-3"> </div>
      <Link
        className="col-span-2 w-max bg-accent text-darkone rounded-xl py-2 px-6 font-semibold cursor-pointer mx-auto"
        href={
          'https://app.steer.finance/vault/0x17694615caba46ef765a3673fa488e04332b522a'
        }
        target="_blank"
      >
        DEPOSIT
      </Link>
    </div>
  );
}
