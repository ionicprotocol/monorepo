/* eslint-disable @next/next/no-img-element */
'use client';
import { useMemo, type Dispatch, type SetStateAction } from 'react';

import dynamic from 'next/dynamic';

import { FLYWHEEL_TYPE_MAP, pools } from '@ui/constants/index';
import { multipliers } from '@ui/utils/multipliers';

import { getAssetName } from '../../util/utils';
// import { Rewards } from '../markets/Rewards';
const Rewards = dynamic(() => import('../markets/Rewards'), {
  ssr: false
});
import BorrowPopover from '../markets/BorrowPopover';
import SupplyPopover from '../markets/SupplyPopover';
import { PopupMode } from '../popup/page';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export enum InfoMode {
  SUPPLY = 0,
  BORROW = 1
}

export type InfoRowsProps = {
  amount: string;
  apr: string;
  asset: string;
  collateralApr: string;
  cToken: `0x${string}`;
  logo: string;
  pool: string;
  membership: boolean;
  mode: InfoMode;
  comptrollerAddress: Address;
  rewards: FlywheelReward[];
  selectedChain: number;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string>>;
  utilization: string;
};

const InfoRows = ({
  amount,
  asset,
  logo,
  membership,
  mode,
  setSelectedSymbol,
  setPopupMode,
  apr,
  selectedChain,
  cToken,
  comptrollerAddress,
  pool,
  rewards
}: InfoRowsProps) => {
  const supplyRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[+selectedChain]?.supply?.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [selectedChain, rewards]
  );
  const totalSupplyRewardsAPR = useMemo(
    () =>
      supplyRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ?? 0,
    [supplyRewards]
  );

  const borrowRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[+selectedChain]?.borrow?.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [selectedChain, rewards]
  );
  const totalBorrowRewardsAPR = useMemo(
    () =>
      borrowRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ?? 0,
    [borrowRewards]
  );
  const totalApr =
    mode === InfoMode.BORROW
      ? 0 - Number(apr) + totalBorrowRewardsAPR
      : Number(apr) + totalSupplyRewardsAPR;

  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 md:grid  grid-cols-5  py-4 text-xs text-white/80 font-semibold text-center items-center relative  ${
        membership && `${pools[+selectedChain].border} border`
      }`}
    >
      {membership && (
        <span
          className={`absolute top-[-9px] right-[-15px] px-2 text-darkone  ${pools[selectedChain].bg} ${pools[+selectedChain].text} rounded-lg`}
        >
          Collateral
        </span>
      )}

      <div
        className={`  flex gap-2 items-center justify-start md:justify-center text-xl md:text-base mb-4 md:mb-2 lg:mb-0 `}
      >
        <img
          alt={asset}
          className="w-10 md:w-7"
          src={logo}
        />
        <h3 className={`  text-lg md:text-sm  `}>
          {getAssetName(asset, selectedChain)}
        </h3>
      </div>
      <h3
        className={` flex justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2  md:hidden text-left">
          AMOUNT:
        </span>
        {amount}
      </h3>
      <h3
        className={` flex justify-between md:justify-center  px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 md:hidden text-left">
          {mode === InfoMode.SUPPLY ? 'SUPPLY' : 'BORROW'} APR:
        </span>
        <div
          className={` mb-2 popover-container relative flex md:flex-col items-center justify-between md:justify-center cursor-pointer`}
        >
          {mode === InfoMode.SUPPLY
            ? totalApr.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })
            : (totalApr > 0 ? '+' : '') +
              totalApr.toLocaleString('en-US', {
                maximumFractionDigits: 1
              })}
          %
          {mode === InfoMode.SUPPLY ? (
            <>
              <SupplyPopover
                asset={asset}
                supplyAPR={Number.parseFloat(apr.replace('%', ''))}
                rewards={supplyRewards}
                dropdownSelectedChain={+selectedChain}
                selectedPoolId={pool}
                cToken={cToken}
                pool={comptrollerAddress}
              />
            </>
          ) : (
            <>
              <BorrowPopover
                asset={asset}
                borrowAPR={Number.parseFloat(apr.replace('%', ''))}
                rewardsAPR={totalBorrowRewardsAPR}
                dropdownSelectedChain={+selectedChain}
                selectedPoolId={pool}
                cToken={cToken}
                pool={comptrollerAddress}
                rewards={borrowRewards}
              />
            </>
          )}
        </div>
      </h3>
      {multipliers[selectedChain]?.[pool]?.[asset]?.borrow?.flywheel &&
      mode == InfoMode.BORROW ? (
        <Rewards
          cToken={cToken as `0x${string}`}
          pool={comptrollerAddress}
          poolChainId={selectedChain}
          type="borrow"
          className="items-center justify-center"
        />
      ) : multipliers[selectedChain]?.[pool]?.[asset]?.supply?.flywheel &&
        mode == InfoMode.SUPPLY ? (
        <Rewards
          cToken={cToken as `0x${string}`}
          pool={comptrollerAddress}
          poolChainId={selectedChain}
          type="supply"
          className="items-center justify-center"
        />
      ) : (
        <div />
      )}
      <div
        className={` flex md:flex-col   mx-auto items-center justify-center gap-3`}
      >
        <button
          className={`w-full uppercase rounded-lg bg-accent text-black py-1.5 px-3`}
          onClick={() => {
            setSelectedSymbol(asset);
            setPopupMode(
              mode === InfoMode.SUPPLY ? PopupMode.WITHDRAW : PopupMode.REPAY
            );
          }}
        >
          {mode === InfoMode.SUPPLY ? 'Withdraw' : 'Repay'}
        </button>

        <button
          className={`w-full uppercase ${pools[+selectedChain].text} ${pools[+selectedChain].bg} rounded-lg text-black py-1.5 px-3`}
          onClick={() => {
            setSelectedSymbol(asset);
            setPopupMode(
              mode === InfoMode.SUPPLY ? PopupMode.SUPPLY : PopupMode.BORROW
            );
          }}
        >
          {mode === InfoMode.SUPPLY ? 'Add Collateral' : 'Borrow More'}
        </button>
      </div>
    </div>
  );
};

export default InfoRows;
