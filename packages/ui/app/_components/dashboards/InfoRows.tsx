/* eslint-disable @next/next/no-img-element */
'use client';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import dynamic from 'next/dynamic';

import { useChainId } from 'wagmi';

import {
  FLYWHEEL_TYPE_MAP,
  NO_COLLATERAL_SWAP,
  pools
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import { multipliers } from '@ui/utils/multipliers';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

const FlyWheelRewards = dynamic(() => import('../markets/FlyWheelRewards'), {
  ssr: false
});
import APRCell from '../markets/APRCell';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export enum InfoMode {
  SUPPLY = 0,
  BORROW = 1
}

type ActiveTab = 'borrow' | 'repay' | 'supply' | 'withdraw';

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
  setActiveTab: Dispatch<SetStateAction<ActiveTab | undefined>>;
  setIsManageDialogOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedSymbol: Dispatch<SetStateAction<string>>;
  utilization: string;
  toggler?: () => void;
  setCollateralSwapFromAsset?: () => void;
};

const InfoRows = ({
  amount,
  asset,
  logo,
  membership,
  mode,
  setSelectedSymbol,
  setActiveTab,
  setIsManageDialogOpen,
  apr,
  selectedChain,
  cToken,
  comptrollerAddress,
  pool,
  rewards,
  toggler,
  setCollateralSwapFromAsset
}: InfoRowsProps) => {
  const walletChain = useChainId();
  const { data: merklApr } = useMerklApr();
  const { getSdk } = useMultiIonic();
  const sdk = getSdk(+selectedChain);
  const type = mode === InfoMode.SUPPLY ? 'supply' : 'borrow';
  const hasFlywheelRewards =
    multipliers[selectedChain]?.[pool]?.[asset]?.[type]?.flywheel;

  const merklAprForToken = merklApr?.find(
    (a) => Object.keys(a)[0].toLowerCase() === cToken.toLowerCase()
  )?.[cToken];

  const supplyRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[+selectedChain]?.supply?.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [selectedChain, rewards]
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

  const totalSupplyRewardsAPR = useMemo(
    () =>
      (supplyRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ??
        0) + (merklAprForToken ?? 0),
    [supplyRewards, merklAprForToken]
  );

  const totalBorrowRewardsAPR = useMemo(
    () =>
      borrowRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ?? 0,
    [borrowRewards]
  );

  const baseAPR = Number.parseFloat(apr.replace('%', ''));
  const totalApr =
    mode === InfoMode.BORROW
      ? 0 - baseAPR + totalBorrowRewardsAPR
      : baseAPR + totalSupplyRewardsAPR;

  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2 gap-x-1 md:grid grid-cols-5 py-4 text-xs text-white/80 font-semibold text-center items-center relative ${
        membership && `${pools[+selectedChain].border} border`
      }`}
    >
      {membership && (
        <span
          className={`absolute top-[-9px] right-[-15px] px-2 text-darkone ${pools[selectedChain].bg} ${pools[+selectedChain].text} rounded-lg`}
        >
          Collateral
        </span>
      )}

      <div className="flex gap-2 items-center justify-start md:justify-center text-xl md:text-base mb-4 md:mb-2 lg:mb-0">
        <img
          alt={asset}
          className="w-10 md:w-7"
          src={logo}
        />
        <h3 className="text-lg md:text-sm">{asset}</h3>
      </div>

      <h3 className="flex justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0">
        <span className="text-white/40 font-semibold mr-2 md:hidden text-left">
          AMOUNT:
        </span>
        {amount}
      </h3>

      <h3 className="flex justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0">
        <span className="text-white/40 font-semibold mr-2 md:hidden text-left">
          {mode === InfoMode.SUPPLY ? 'SUPPLY' : 'BORROW'} APR:
        </span>
        <APRCell
          type={mode === InfoMode.SUPPLY ? 'supply' : 'borrow'}
          aprTotal={totalApr}
          baseAPR={baseAPR}
          asset={asset}
          cToken={cToken}
          dropdownSelectedChain={+selectedChain}
          pool={comptrollerAddress}
          selectedPoolId={pool}
          rewards={mode === InfoMode.SUPPLY ? supplyRewards : borrowRewards}
        />
      </h3>
      {hasFlywheelRewards ? (
        <FlyWheelRewards
          cToken={cToken as `0x${string}`}
          pool={comptrollerAddress}
          poolChainId={selectedChain}
          type={type}
          isStandalone
        />
      ) : (
        <div />
      )}
      <div
        className={` flex md:flex-col   mx-auto items-center justify-center gap-3`}
      >
        <button
          className={`w-full uppercase rounded-lg bg-accent text-black py-1.5 px-3`}
          onClick={async () => {
            const result = await handleSwitchOriginChain(
              selectedChain,
              walletChain
            );
            if (result) {
              setSelectedSymbol(asset);
              setIsManageDialogOpen(true);
              setActiveTab(mode === InfoMode.SUPPLY ? 'supply' : 'repay');
            }
          }}
        >
          {mode === InfoMode.SUPPLY ? 'Withdraw / Add Collateral' : 'Repay'}
        </button>

        {!NO_COLLATERAL_SWAP[selectedChain]?.[pool]?.includes(asset) && (
          <button
            className={`w-full uppercase ${pools[+selectedChain].text} ${pools[+selectedChain].bg} rounded-lg text-black py-1.5 px-3 disabled:opacity-50`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(
                selectedChain,
                walletChain
              );
              if (result) {
                if (mode === InfoMode.SUPPLY) {
                  // Router.push()
                  //toggle the mode
                  setSelectedSymbol(asset);
                  setCollateralSwapFromAsset?.();
                  toggler?.();
                }
                if (mode === InfoMode.BORROW) {
                  // Router.push()
                  // toggle the mode
                  setSelectedSymbol(asset);
                  setIsManageDialogOpen(true);
                  setActiveTab('borrow');
                }
              }
            }}
            disabled={
              !sdk?.chainDeployment[`CollateralSwap-${comptrollerAddress}`]
            }
          >
            {mode === InfoMode.SUPPLY ? 'COLLATERAL SWAP' : 'Borrow More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoRows;
