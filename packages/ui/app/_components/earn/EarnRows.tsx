'use client';

import Link from 'next/link';

export type EarnRow = {
  apr?: number | string;
  asset: string[]; //name of the asset in uppercase array
  getApr: () => Promise<number>;
  getTvl: () => Promise<number>;
  link: string;
  network?: string;
  protocol?: string;
  tvl: number;
};

type EarnRowsParams = {
  rows: EarnRow[];
};
export default function EarnRows({ rows }: EarnRowsParams) {
  return (
    <>
      {rows.map(({ apr, asset, network, protocol, tvl, link }, idx) => (
        <div
          className=" w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl my-3 px-2 gap-x-1 md:grid  grid-cols-13  py-4 text-sm text-white lg:text-center items-center relative flex flex-col "
          key={idx}
        >
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
                  src={`/img/symbols/32/color/${coin}.png`}
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
          <div className="popover-container relative flex lg:flex-col items-center cursor-pointer">
            <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2">
              <span className="text-white/40 text-xs font-semibold md:hidden">
                APR
              </span>
              {apr && Number(apr) > 0 ? apr : '-'}%
            </div>
            <span
              className={`text-xs font-bold rounded-lg bg-lime text-darkone w-20 ml-1 lg:ml-0 text-center`}
            >
              + POINTS <i className="popover-hint">i</i>
            </span>
            <span className="text-xs font-bold text-darkone bg-accent rounded-lg w-20 ml-1 lg:ml-0 text-center mt-1">
              + TURTLE <i className="popover-hint">i</i>
            </span>
            <div
              className={`font-bold popover absolute w-[160px] top-full p-2 mt-1 border border-mode rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap`}
            >
              Base APR: {apr && Number(apr) > 0 ? apr : '-'}%
              <div className="flex pt-4">
                <img
                  alt=""
                  className="size-4 rounded mr-1"
                  src="/img/ionic-sq.png"
                />{' '}
                + 3x Ionic Points
              </div>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 rounded mr-1"
                  src="/images/turtle-ionic.png"
                />{' '}
                + Turtle Ionic Points
              </div>
            </div>
          </div>
          <div className="col-span-1 w-full flex justify-between md:justify-center gap-x-2">
            <span className="text-white/40 text-xs font-semibold md:hidden">
              TVL
            </span>
            $
            {tvl > 0
              ? tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : '-'}
          </div>
          <div className="col-span-3"> </div>
          <Link
            className="col-span-2 w-max bg-accent text-darkone rounded-xl py-2 px-6 font-semibold cursor-pointer mx-auto flex items-center justify-center gap-2"
            href={link}
            target="_blank"
          >
            <span>DEPOSIT</span>
            <img
              alt="external-link"
              className={`w-3 h-3`}
              src="https://img.icons8.com/material-outlined/24/external-link.png"
            />
          </Link>
        </div>
      ))}
    </>
  );
}
