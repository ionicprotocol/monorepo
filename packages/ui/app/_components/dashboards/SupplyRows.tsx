/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
interface ISupply {
  amount: number;
  asset: string;
  cAPR: number;
  mode?: string;
  rewards: number;
  sAPR: number;
  utilisation: number;
}
const SupplyRows = ({
  asset,
  amount,
  cAPR,
  sAPR,
  utilisation,
  rewards,
  mode = 'SUPPLY'
}: ISupply) => {
  const pathname = usePathname();
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 grid  grid-cols-8  py-4 text-xs text-white/80 font-semibold text-center items-center `}
    >
      <div className={`  flex gap-2 items-center justify-center  `}>
        <img
          alt={asset}
          className="h-7"
          src={`/img/logo/${asset}.png `}
        />
        <h3 className={` `}>{asset}</h3>
      </div>
      <h3 className={``}>{amount}</h3>
      <h3 className={``}>{cAPR}</h3>
      <h3 className={``}>{sAPR}</h3>
      <h3 className={``}>{utilisation}</h3>
      <h3 className={``}>{rewards}</h3>
      <div className={` col-span-2 flex items-center justify-center gap-3`}>
        <Link
          className={`w-full rounded-lg bg-accent text-black py-1.5 px-3`}
          href={`${pathname}?popmode=${
            mode === 'SUPPLY'
              ? 'BORROW&specific=REPAY'
              : 'SUPPLY&specific=WITHDRAW'
          }`}
          // changed on borrow condition
        >
          {mode === 'SUPPLY' ? 'REPAY' : 'Withdraw'}
        </Link>
        <Link
          className={`w-full rounded-lg border text-white/50 border-white/50 py-1.5 px-3`}
          href={`${pathname}?popmode=DEFAULT`}
        >
          Manage
        </Link>
      </div>
    </div>
  );
};

export default SupplyRows;
