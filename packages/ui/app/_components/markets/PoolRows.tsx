/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';

import Link from 'next/link';

import { useStore } from 'ui/store/Store';

import {
  FLYWHEEL_TYPE_MAP,
  pools,
  shouldGetFeatured
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import BorrowPopover from './BorrowPopover';
import SupplyPopover from './SupplyPopover';
import { getAssetName } from '../../util/utils';
import { PopupMode } from '../popup/page';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

interface IRows {
  asset: string;
  borrowAPR?: number;
  borrowBalance: string;
  chain: string;
  collateralFactor: number;
  comptrollerAddress: Address;
  cTokenAddress: Address;
  dropdownSelectedChain: number;
  logo: string;
  loopMarkets?: LoopMarketData | undefined;
  loopPossible: boolean;
  membership: boolean;
  pool: string;
  selectedChain: number;
  rewards?: FlywheelReward[];
  selectedMarketData: MarketData | undefined;
  selectedPoolId: string;
  selectedSymbol: string;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  supplyAPR?: number;
  supplyBalance: string;
  totalBorrowing: string;
  totalSupplied: string;
}

const PoolRows = ({
  asset,
  supplyBalance,
  totalSupplied,
  borrowBalance,
  chain,
  collateralFactor,
  cTokenAddress,
  dropdownSelectedChain,
  membership,
  totalBorrowing,
  supplyAPR,
  borrowAPR,
  logo,
  loopPossible,
  pool,
  setSelectedSymbol,
  setPopupMode,
  selectedChain,
  selectedPoolId,
  comptrollerAddress,
  rewards
}: IRows) => {
  const { address } = useMultiIonic();
  const { data: merklApr } = useMerklApr();

  const merklAprForToken = merklApr?.find(
    (a) => Object.keys(a)[0].toLowerCase() === cTokenAddress.toLowerCase()
  )?.[cTokenAddress];

  const supplyRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[dropdownSelectedChain]?.supply?.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [dropdownSelectedChain, rewards]
  );
  const totalSupplyRewardsAPR = useMemo(
    () =>
      (supplyRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ??
        0) + (merklAprForToken ?? 0),
    [supplyRewards, merklAprForToken]
  );

  const borrowRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[dropdownSelectedChain]?.borrow?.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [dropdownSelectedChain, rewards]
  );
  const totalBorrowRewardsAPR = useMemo(
    () =>
      borrowRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ?? 0,
    [borrowRewards]
  );

  const { data: borrowCapsData } = useBorrowCapsDataForAsset(
    cTokenAddress,
    dropdownSelectedChain
  );

  const borrowAPRTotal =
    typeof borrowAPR !== 'undefined'
      ? 0 - borrowAPR + totalBorrowRewardsAPR
      : undefined;
  const supplyAPRTotal =
    typeof supplyAPR !== 'undefined'
      ? supplyAPR + totalSupplyRewardsAPR
      : undefined;

  //type the asset name to get it featured
  // shouldGetFeatured
  // const setFeaturedBorrow = useStore((state) => state.setFeaturedBorrow);
  const setFeaturedSupply = useStore((state) => state.setFeaturedSupply);
  const setFeaturedSupply2 = useStore((state) => state.setFeaturedSupply2);

  useEffect(() => {
    if (
      shouldGetFeatured.featuredSupply2[+dropdownSelectedChain][
        pool
      ].toLowerCase() === asset.toLowerCase()
    ) {
      // setFeaturedBorrow({
      //   dropdownSelectedChain,
      //   borrowAPR,
      //   rewardsAPR: totalBorrowRewardsAPR,
      //   selectedPoolId,
      //   cToken: cTokenAddress,
      //   pool: comptrollerAddress,
      //   rewards: borrowRewards,
      //   asset,
      //   loopPossible
      // });
      setFeaturedSupply2({
        asset: asset,
        supplyAPR: supplyAPR,
        supplyAPRTotal: supplyAPRTotal,
        rewards: supplyRewards,
        dropdownSelectedChain: dropdownSelectedChain,
        selectedPoolId: selectedPoolId,
        cToken: cTokenAddress,
        pool: comptrollerAddress
      });
    }
    if (
      shouldGetFeatured.featuredSupply[+dropdownSelectedChain][
        pool
      ].toLowerCase() === asset.toLowerCase()
    ) {
      setFeaturedSupply({
        asset: asset,
        supplyAPR: supplyAPR,
        supplyAPRTotal: supplyAPRTotal,
        rewards: supplyRewards,
        dropdownSelectedChain: dropdownSelectedChain,
        selectedPoolId: selectedPoolId,
        cToken: cTokenAddress,
        pool: comptrollerAddress
      });
    }
  }, [
    asset,
    cTokenAddress,
    comptrollerAddress,
    dropdownSelectedChain,
    pool,
    selectedPoolId,
    setFeaturedSupply,
    setFeaturedSupply2,
    supplyAPR,
    supplyAPRTotal,
    supplyRewards
  ]);
  // console.log(borrowCapAsNumber, asset);
  return (
    <div
      className={`w-full h-full md:grid grid-cols-20 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 relative  ${
        membership && `border ${pools[dropdownSelectedChain].border}`
      }`}
    >
      {membership && (
        <span
          className={`w-min hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 py-1 px-3  gap-x-1 md:grid md:-right-5 -right-3 md:-top-5 -top-1 text-xs text-white/80 font-semibold md:text-center  items-center absolute ${
            membership && `border ${pools[dropdownSelectedChain].border}`
          }`}
        >
          Collateral
        </span>
      )}
      <Link
        className={`w-full  md:grid grid-cols-10 gap-x-2 md:gap-x-1 col-span-10 py-4 text-[11px] text-white/80 font-semibold md:text-center items-center relative cursor-pointer `}
        href={{
          pathname: `/market/details/${asset}`,
          query: {
            chain: chain,
            comptrollerAddress,
            cTokenAddress,
            dropdownSelectedChain,
            lendingSupply: Number.parseInt(supplyBalance),
            // loopMarkets: loopMarketsPassing,
            pool: pool,
            borrowAPR: borrowAPR ?? '-',
            supplyAPR: supplyAPR ?? '-',
            selectedChain: selectedChain,
            // selectedMarketData: selectedMarketDataPassing,
            selectedSymbol: asset
          }
        }}
        // onClick={() => sendPassedData()}
      >
        <div
          className={`col-span-2 flex md:justify-center justify-start  items-center mb-4 md:mb-0  gap-2 pt-4 pl-2 md:pt-0 md:pl-0`}
        >
          <img
            alt={asset}
            className={`w-10 md:w-7`}
            src={logo}
          />
          <h3 className={` text-lg md:text-sm `}>
            {getAssetName(asset, dropdownSelectedChain)}
          </h3>
        </div>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            SUPPLY BALANCE:
          </span>
          <span className={`md:text-center text-right`}> {supplyBalance}</span>
        </h3>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2  text-[11px] md:hidden text-left">
            TOTAL SUPPLIED:
          </span>
          <span className={`md:text-center text-right`}>{totalSupplied}</span>
        </h3>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            BORROW BALANCE:
          </span>
          <span className={`md:text-center text-right`}>{borrowBalance}</span>
        </h3>
        <h3
          className={` col-span-2 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 md:hidden  text-[11px] text-left">
            TOTAL BORROWING:
          </span>
          <span className={`md:text-center text-right`}>{totalBorrowing}</span>
        </h3>
      </Link>

      <h3
        className={` col-span-2 flex  justify-between md:justify-center px-2 md:px-0 text-xs  md:py-4 py-0 items-center mb-2 md:mb-0 `}
      >
        <span className="text-white/40 font-semibold mr-2 md:hidden text-left text-[11px]  ">
          SUPPLY APR:
        </span>
        <div className="popover-container relative flex md:flex-col items-center justify-between md:justify-center cursor-pointer">
          <span className="mr-1 md:mr-0 md:mb-1">
            +
            {supplyAPRTotal?.toLocaleString('en-US', {
              maximumFractionDigits: 2
            }) ?? '-'}
            %{' '}
            {/* {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.underlyingAPR &&
              '(+' +
                (multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                  asset
                ]?.supply?.underlyingAPR).toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }) +
                '%)'} */}
          </span>

          <SupplyPopover
            asset={asset}
            supplyAPR={supplyAPR}
            rewards={supplyRewards}
            dropdownSelectedChain={dropdownSelectedChain}
            selectedPoolId={selectedPoolId}
            cToken={cTokenAddress}
            pool={comptrollerAddress}
          />
        </div>
      </h3>
      <h3
        className={` col-span-2  md:py-4 text-xs flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-1 sm:mr-2 md:hidden text-[11px] text-left">
          BORROW APR:
        </span>
        <div className="popover-container flex h-full md:flex-col items-center justify-center  cursor-pointer">
          <span className="mr-1 md:mr-0 md:mb-1">
            {borrowAPRTotal ? (borrowAPRTotal > 0 ? '+' : '') : ''}
            {borrowAPRTotal?.toLocaleString('en-US', {
              maximumFractionDigits: 1
            }) ?? '-'}
            %
          </span>

          <BorrowPopover
            asset={asset}
            borrowAPR={borrowAPR}
            rewardsAPR={totalBorrowRewardsAPR}
            dropdownSelectedChain={dropdownSelectedChain}
            selectedPoolId={selectedPoolId}
            cToken={cTokenAddress}
            pool={comptrollerAddress}
            rewards={borrowRewards}
          />
        </div>
      </h3>
      <h3
        className={` col-span-2 text-xs  flex md:block justify-between md:justify-center px-2 md:px-0 font-semibold rounded-md text-center items-center  md:my-auto  `}
      >
        <span className="text-white/40 font-semibold text-[11px] text-center md:hidden ">
          COLLATERAL FACTOR:
        </span>
        {collateralFactor}%
      </h3>
      <div
        className={` col-span-4 mx-auto flex items-center justify-center h-full gap-2 text-xs md:text-[10px]  font-semibold  px-2 lg:px-10 w-full`}
      >
        <div
          className={`md:flex md:flex-col grid grid-cols-2 h-min md:gap-y-1 gap-x-1 md:my-0 w-full my-3 `}
        >
          {/* <button
              className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} py-1.5 px-3 uppercase truncate`}
            >
              Cross Chain Supply
            </button> */}
          <button
            className={`rounded-md bg-accent disabled:opacity-50 text-black py-1.5 px-1   uppercase truncate `}
            onClick={async () => {
              const result = await handleSwitchOriginChain(
                dropdownSelectedChain,
                selectedChain
              );
              if (result) {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.SUPPLY);
              }
            }}
            disabled={!address}
          >
            Supply / Withdraw
          </button>
          <button
            className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} disabled:opacity-50 py-1.5 px-1 uppercase truncate`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(
                dropdownSelectedChain,
                selectedChain
              );
              if (result) {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.BORROW);
              }
            }}
            disabled={
              (!address ||
                (borrowCapsData
                  ? borrowCapsData?.totalBorrowCap <= 1
                  : false)) &&
              !loopPossible
            }
          >
            {(borrowCapsData ? borrowCapsData?.totalBorrowCap <= 1 : false) &&
            loopPossible
              ? 'Loop'
              : `Borrow / Repay${loopPossible ? ' / Loop' : ''}`}
          </button>
        </div>
        {/* {!address && (
          <div className="connect-button my-3 md:my-0">
            <ConnectButton size="sm" />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PoolRows;
