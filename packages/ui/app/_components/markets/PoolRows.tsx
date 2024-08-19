/* eslint-disable @next/next/no-img-element */
'use client';
import { type FlywheelReward } from '@ionicprotocol/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { type Address } from 'viem';
import { mode } from 'viem/chains';

import { getAssetName } from '../../util/utils';
import ConnectButton from '../ConnectButton';
import { PopupMode } from '../popup/page';

// import { Rewards } from './Rewards';
const Rewards = dynamic(() => import('./Rewards'), {
  ssr: false
});

import { FLYWHEEL_TYPE_MAP, pools } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import type { MarketData } from '@ui/types/TokensDataMap';
import { multipliers } from '@ui/utils/multipliers';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

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
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');

  const supplyRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[dropdownSelectedChain].supply.includes(
          (reward as FlywheelReward).flywheel
        )
      ),
    [dropdownSelectedChain, rewards]
  );
  const totalSupplyRewardsAPR = useMemo(
    () =>
      supplyRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ?? 0,
    [supplyRewards]
  );

  const borrowRewards = useMemo(
    () =>
      rewards?.filter((reward) =>
        FLYWHEEL_TYPE_MAP[dropdownSelectedChain].borrow.includes(
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

  const borrowAPRTotal =
    typeof borrowAPR !== 'undefined'
      ? 0 - borrowAPR + totalBorrowRewardsAPR
      : undefined;
  const supplyAPRTotal =
    typeof supplyAPR !== 'undefined'
      ? supplyAPR + totalSupplyRewardsAPR
      : undefined;

  return (
    <div
      className={`w-full h-full md:grid grid-cols-20 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 relative  ${
        membership && `border ${pools[dropdownSelectedChain].border}`
      }`}
    >
      {membership && (
        <span
          className={`w-min hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 py-1 px-3  gap-x-1 md:grid md:-right-5 -right-3 md:-top-5 -top-1 text-xs text-white/80 font-semibold md:text-center items-center absolute ${
            membership && `border ${pools[dropdownSelectedChain].border}`
          }`}
        >
          Collateral
        </span>
      )}
      <Link
        className={`w-full  md:grid grid-cols-10 gap-x-1 col-span-10 py-4 text-xs text-white/80 font-semibold md:text-center items-center relative cursor-pointer `}
        href={{
          pathname: `/market/details/${asset}`,
          query: {
            availableAPR: supplyAPR ? supplyAPR : 0,
            borrowAPR: borrowAPR ? borrowAPR : 0,
            chain: chain,
            collateralAPR: collateralFactor,
            comptrollerAddress,
            cTokenAddress,
            dropdownSelectedChain,
            lendingSupply: parseInt(supplyBalance),
            // loopMarkets: loopMarketsPassing,
            pool: pool,
            selectedChain: selectedChain,
            // selectedMarketData: selectedMarketDataPassing,
            selectedSymbol: asset,
            totalBorrows: totalBorrowing,
            totalSupplied,
            totalCollateral: 123456
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
          <span className={`mr-1 md:mr-0`}>
            +
            {supplyAPRTotal?.toLocaleString('en-US', {
              maximumFractionDigits: 1
            }) ?? '-'}
            %
          </span>
          {selectedPoolId === '0' &&
            querychain === '34443' &&
            (asset.toLowerCase() === 'usdc' ||
              asset.toLowerCase() === 'weth' ||
              asset.toLowerCase() === 'stone' ||
              asset.toLowerCase() === 'ezeth') && (
              <a
                className="text-red-600 bg-red-50  expan rounded-md w-max ml-1 md:ml-0 text-center my-1 flex items-center justify-center gap-1"
                href="https://jumper.exchange/superfest/"
                target="_blank"
              >
                <div
                  className={`flex items-center md:text-[10px] text-[8px] justify-center gap-0.5 py-[1px] px-[4px]`}
                >
                  <img
                    alt="OP fest"
                    className={`w-4 h-4 inline-block `}
                    src="/img/logo/superOP.png"
                  />
                  <span className={``}>OP FEST</span>
                  <img
                    alt="external-link"
                    className={`w-3 h-3`}
                    src="https://img.icons8.com/material-outlined/24/external-link.png"
                  />
                </div>
              </a>
            )}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
            ?.ionRewards && (
            <span
              className={` bg-accent text-green-900 rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-3.5 px-1`}
            >
              + ION APR <i className="popover-hint">i</i>
            </span>
          )}
          <span
            className={`${pools[dropdownSelectedChain].text} ${pools[dropdownSelectedChain].bg} rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-2.5 px-1`}
          >
            + REWARDS <i className="popover-hint">i</i>
          </span>
          <span className="text-darkone  rounded-md w-max  md:ml-0 text-center ">
            <a
              className="text-darkone bg-white rounded-md w-max ml-1 md:ml-0 text-center py-[1px] md:px-3 px-1 flex items-center justify-center gap-1 md:text-[10px] text-[8px]"
              href="https://turtle.club/dashboard/?ref=IONIC"
              target="_blank"
            >
              + TURTLE{' '}
              <img
                alt="external-link"
                className={`w-3 h-3`}
                src="https://img.icons8.com/material-outlined/24/external-link.png"
              />
            </a>
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
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.ionRewards && (
            <span
              className={`bg-accent text-green-900 rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-3.5 px-1`}
            >
              + ION APR <i className="popover-hint">i</i>
            </span>
          )}
          <span
            className={`${pools[dropdownSelectedChain].text} ${pools[dropdownSelectedChain].bg} rounded-md w-max md:text-[10px] text-[8px] md:mb-1 py-[1px] md:px-2.5 px-1 ml-1 md:ml-0 text-center`}
          >
            + REWARDS <i className="popover-hint">i</i>
          </span>
          <a
            className="text-darkone bg-white rounded-md w-max md:text-[10px] text-[8px]  py-[1px] md:px-3 px-1 ml-1 md:ml-0 text-center  flex items-center justify-center gap-1"
            href="https://turtle.club/dashboard/?ref=IONIC"
            target="_blank"
          >
            + TURTLE{' '}
            <img
              alt="external-link"
              className={`w-3 h-3`}
              src="https://img.icons8.com/material-outlined/24/external-link.png"
            />
          </a>

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
        {address && (
          <div
            className={`md:flex md:flex-col grid grid-cols-2 h-min md:gap-y-1 gap-x-1 md:my-0 w-full my-3 `}
          >
            {/* <button
              className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} py-1.5 px-3 uppercase truncate`}
            >
              Cross Chain Supply
            </button> */}
            <button
              className={`rounded-md bg-accent text-black py-1.5 px-1   uppercase truncate `}
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
            >
              Supply / Withdraw
            </button>
            <button
              className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} py-1.5 px-1 uppercase truncate`}
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
            >
              Borrow / Repay {loopPossible && '/ Loop'}
            </button>
          </div>
        )}

        {!address && (
          <div className="connect-button my-3 md:my-0">
            <ConnectButton size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

type BorrowPopoverProps = {
  dropdownSelectedChain: number;
  borrowAPR?: number;
  rewardsAPR?: number;
  selectedPoolId: string;
  asset: string;
  cToken: Address;
  pool: Address;
  rewards?: FlywheelReward[];
};
const BorrowPopover = ({
  dropdownSelectedChain,
  borrowAPR,
  rewards,
  selectedPoolId,
  asset,
  cToken,
  pool
}: BorrowPopoverProps) => {
  return (
    <div
      className={`popover absolute min-w-[190px] top-full p-2 px-2 mt-1 border ${pools[dropdownSelectedChain].border} rounded-md text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all`}
    >
      <div className="">
        Base APR:{' '}
        {typeof borrowAPR !== 'undefined' ? (borrowAPR > 0 ? '-' : '') : ''}
        {borrowAPR
          ? borrowAPR.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : '-'}
        %
      </div>
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
        ?.borrow && (
        <>
          {/* {(asset.toLowerCase() === 'usdc' ||
          asset.toLowerCase() === 'weth' ||
          asset.toLowerCase() === 'ezeth') && (
          <a
            href="https://jumper.exchange/superfest/"
            className="flex pr-2 pt-4"
          >
            <img
              alt=""
              className="size-4 rounded mr-1"
              src="/img/logo/superOP.png"
            />{' '}
            + OP SuperFest rewards
          </a>
        )} */}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.flywheel && (
            <Rewards
              cToken={cToken}
              pool={pool}
              poolChainId={dropdownSelectedChain}
              type="borrow"
              rewards={rewards}
            />
          )}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.ionic > 0 && (
            <>
              <div className="flex ">
                <img
                  alt=""
                  className="size-4 rounded mr-1"
                  src="/img/ionic-sq.png"
                />{' '}
                +{' '}
                {
                  multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                    ?.borrow?.ionic
                }
                x Ionic Points
              </div>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 rounded mr-1"
                  src="/images/turtle-ionic.png"
                />{' '}
                + Turtle Ionic Points
              </div>
            </>
          )}

          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.mode && (
            <>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
                />{' '}
                +{' '}
                {
                  multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                    ?.borrow?.mode
                }
                x Mode Points
              </div>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/turtle-mode.png"
                />{' '}
                + Turtle Mode Points
              </div>
            </>
          )}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.etherfi && (
            <>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/etherfi.png"
                />{' '}
                +{' '}
                {
                  multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                    ?.borrow?.etherfi
                }
                x ether.fi Points
              </div>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/turtle-etherfi.png"
                />{' '}
                + Turtle ether.fi Points
              </div>
            </>
          )}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.kelp && (
            <>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/kelpmiles.png"
                />{' '}
                +{' '}
                {
                  multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                    ?.borrow?.kelp
                }
                x Kelp Miles
              </div>
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/turtle-renzo.png"
                />{' '}
                + Turtle Kelp Points
              </div>
            </>
          )}
          {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow
            ?.eigenlayer && (
            <div className="flex">
              <img
                alt=""
                className="size-4 mr-1"
                src="/images/eigen.png"
              />{' '}
              + EigenLayer Points
            </div>
          )}
        </>
      )}
    </div>
  );
};

type SupplyPopoverProps = {
  asset: string;
  cToken: Address;
  dropdownSelectedChain: number;
  pool: Address;
  selectedPoolId: string;
  supplyAPR?: number;
  rewards?: FlywheelReward[];
};

const SupplyPopover = ({
  asset,
  cToken,
  dropdownSelectedChain,
  pool,
  selectedPoolId,
  supplyAPR,
  rewards
}: SupplyPopoverProps) => {
  return (
    <div
      className={`popover absolute min-w-[190px] top-full p-2 px-2 mt-1 border ${pools[dropdownSelectedChain].border} rounded-md text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap`}
    >
      Base APR: +
      {typeof supplyAPR !== 'undefined'
        ? supplyAPR.toLocaleString('en-US', { maximumFractionDigits: 2 })
        : '-'}
      %
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.flywheel && (
        <Rewards
          cToken={cToken}
          pool={pool}
          poolChainId={dropdownSelectedChain}
          type="supply"
          rewards={rewards}
        />
      )}
      {selectedPoolId === '0' &&
        dropdownSelectedChain === mode.id &&
        (asset.toLowerCase() === 'usdc' ||
          asset.toLowerCase() === 'weth' ||
          asset.toLowerCase() === 'stone' ||
          asset.toLowerCase() === 'ezeth') && (
          <a
            href="https://jumper.exchange/superfest/"
            target="_blank"
            className="flex pr-4 underline pt-4"
          >
            <img
              alt=""
              className="size-4 rounded mr-1"
              src="/img/logo/superOP.png"
            />{' '}
            + OP SuperFest rewards
          </a>
        )}
      {(multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.ionic ?? 0) > 0 && (
        <>
          <div className="flex mt-1">
            <img
              alt=""
              className="size-4 rounded mr-1"
              src="/img/ionic-sq.png"
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.ionic
            }
            x Ionic Points
          </div>
          <div className="flex">
            <img
              alt=""
              className="size-4 rounded mr-1"
              src="/images/turtle-ionic.png"
            />{' '}
            + Turtle Ionic Points
          </div>
        </>
      )}
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.mode && (
        <>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.mode
            }
            x Mode Points
          </div>
          <div className="flex">
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.mode && (
              <>
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/turtle-mode.png"
                />{' '}
                + Turtle Mode Points
              </>
            )}
          </div>
        </>
      )}
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.etherfi && (
        <>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/etherfi.png"
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.etherfi
            }
            x ether.fi Points
          </div>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/turtle-etherfi.png"
            />{' '}
            + Turtle ether.fi Points
          </div>
        </>
      )}
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.renzo && (
        <>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/renzo.png"
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.renzo
            }
            x Renzo Points
          </div>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/turtle-renzo.png"
            />{' '}
            + Turtle Renzo Points
          </div>
        </>
      )}
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.kelp && (
        <>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/kelpmiles.png"
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.kelp
            }
            x Kelp Miles
          </div>
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/turtle-renzo.png"
            />{' '}
            + Turtle Kelp Points
          </div>
        </>
      )}
      {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.eigenlayer && (
        <div className="flex">
          <img
            alt=""
            className="size-4 mr-1"
            src="/images/eigen.png"
          />{' '}
          + EigenLayer Points
        </div>
      )}
    </div>
  );
};

export default PoolRows;
