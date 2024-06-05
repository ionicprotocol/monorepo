/* eslint-disable @next/next/no-img-element */
'use client';
// import Link from 'next/link';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
// import { mode } from 'viem/chains';

import { getAssetName } from '../../util/utils';
import ConnectButton from '../ConnectButton';
import { PopupMode } from '../popup/page';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { multipliers } from '@ui/utils/multipliers';
import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
// import { extractAndConvertStringTOValue } from '@ui/utils/stringToValue';
// import { useStore } from 'ui/store/Store';
// import { useAccount } from 'wagmi';

interface IRows {
  asset: string;
  borrowAPR: string;
  borrowBalance: string;
  collateralFactor: number;
  comptrollerAddress: string;
  dropdownSelectedChain: number;
  logo: string;
  loopMarkets: LoopMarketData | undefined;
  loopPossible: boolean;
  membership: boolean;
  selectedChain: number;
  selectedMarketData: MarketData | undefined;
  selectedPoolId: string;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  supplyAPR: string;
  supplyBalance: string;
  totalBorrowing: string;
  totalSupplied: string;
}

const chainColors = (chainId: number) => {
  if (chainId === 34443) {
    return { bg: 'bg-lime', border: 'border-lime', text: 'text-darkone' };
  }
  if (chainId === 8453) {
    return { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-white' };
  }
  return { bg: 'bg-lime', border: 'border-lime', text: 'text-darkone' };
};
const PoolRows = ({
  asset,
  supplyBalance,
  totalSupplied,
  borrowBalance,
  collateralFactor,
  dropdownSelectedChain,
  membership,
  totalBorrowing,
  supplyAPR,
  borrowAPR,
  logo,
  loopPossible,
  setSelectedSymbol,
  setPopupMode,
  selectedChain,
  selectedPoolId,
  comptrollerAddress,
  selectedMarketData,
  loopMarkets
}: IRows) => {
  const { address } = useMultiIonic();
  // const btnref = useRef<boolean>();
  // const searchParams = useSearchParams();
  // const querychain = searchParams.get('chain');
  // const router = useRouter();
  // console.log(querychain);
  // const setPassedData = useStore((state) => state.setPassedData);
  // function sendPassedData() {
  //   // console.log({totalBorrowing});
  //   setPassedData({
  //     availableAPR: parseInt(supplyAPR),
  //     borrowAPR: parseInt(borrowAPR),
  //     collateralAPR: collateralFactor,
  //     lendingSupply: parseInt(supplyBalance),
  //     totalBorrows: extractAndConvertStringTOValue(totalBorrowing).value2,
  //     totalCollateral: 123456
  //   });
  //   // console.log(e.currentTarget);
  //   // if (btnref.current) return;
  //   // router.push(`/market/details/${asset}`);
  // }
  // console.log(totalBorrowing);
  const selectedMarketDataPassing = JSON.stringify(selectedMarketData);
  const loopMarketsPassing = JSON.stringify(loopMarkets);
  return (
    <div
      className={`w-full h-full lg:grid grid-cols-20 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 `}
    >
      <Link
        className={`w-full  lg:grid grid-cols-16 gap-x-1 col-span-16 py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative cursor-pointer ${
          membership && `border ${chainColors(dropdownSelectedChain).border}`
        }`}
        href={{
          pathname: `/market/details/${asset}`,
          query: {
            availableAPR: parseInt(supplyAPR),
            borrowAPR: parseInt(borrowAPR),
            collateralAPR: collateralFactor,
            comptrollerAddress: comptrollerAddress,
            dropdownSelectedChain: dropdownSelectedChain,
            lendingSupply: parseInt(supplyBalance),
            loopMarkets: loopMarketsPassing,
            selectedChain: selectedChain,
            selectedMarketData: selectedMarketDataPassing,
            totalBorrows: totalBorrowing,
            totalCollateral: 123456
          }
        }}
        // onClick={() => sendPassedData()}
      >
        {membership && (
          <span
            className={`absolute top-[-9px] right-[-15px] px-2 ${
              chainColors(dropdownSelectedChain).text
            } ${chainColors(dropdownSelectedChain).bg} rounded-lg`}
          >
            Collateral
          </span>
        )}

      <div
        className={`col-span-2 flex justify-center items-center mb-2 lg:mb-0  flex gap-2 items-center justify-center  `}
      >
        <img
          alt={asset}
          className="h-7"
          src={logo}
        />
        <h3 className={` `}>{getAssetName(asset, dropdownSelectedChain)}</h3>
      </div>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          SUPPLY BALANCE:
        </span>
        {supplyBalance}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          TOTAL SUPPLIED:
        </span>
        {totalSupplied}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          BORROW BALANCE:
        </span>
        {borrowBalance}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          TOTAL BORROWING:
        </span>
        {totalBorrowing}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          SUPPLY APR:
        </span>
        <div className="popover-container relative flex lg:flex-col items-center cursor-pointer">
          {supplyAPR}
          <span
            className={`${chainColors(dropdownSelectedChain).text} ${
              chainColors(dropdownSelectedChain).bg
            } rounded-lg w-20 ml-1 lg:ml-0 text-center`}
          >
            + POINTS <i className="popover-hint">i</i>
          </span>
          <span className="text-darkone bg-accent rounded-lg w-20 ml-1 lg:ml-0 text-center mt-1">
          <a
            className="text-darkone bg-accent rounded-lg w-20 ml-1 lg:ml-0 text-center mt-1 flex items-center justify-center gap-1"
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
          <div
            className={`popover absolute w-[170px] top-full p-2 mt-1 border ${
              chainColors(dropdownSelectedChain).border
            } rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap`}
          >
            Base APR: {supplyAPR}
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.ionic && (
              <>
                <div className="flex pt-4">
                  <img
                    alt=""
                    className="size-4 rounded mr-1"
                    src="/img/ionic-sq.png"
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.supply?.ionic
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
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.mode && (
              <>
                <div className="flex">
                  <img
                    alt=""
                    className="size-4 mr-1"
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.supply?.mode
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
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.etherfi && (
              <>
                <div className="flex">
                  <img
                    alt=""
                    className="size-4 mr-1"
                    src="/images/etherfi.png"
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.supply?.etherfi
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
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.renzo && (
              <>
                <div className="flex">
                  <img
                    alt=""
                    className="size-4 mr-1"
                    src="/images/renzo.png"
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.supply?.renzo
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
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.kelp && (
              <>
                <div className="flex">
                  <img
                    alt=""
                    className="size-4 mr-1"
                    src="/images/kelpmiles.png"
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.supply?.kelp
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
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.supply?.eigenlayer && (
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
        </div>
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          BORROW APR:
        </span>
        <div className="popover-container flex lg:flex-col items-center cursor-pointer">
          {borrowAPR}
          <span
            className={`${chainColors(dropdownSelectedChain).text} ${
              chainColors(dropdownSelectedChain).bg
            } rounded-lg w-20 ml-1 lg:ml-0 text-center`}
          >
            + POINTS <i className="popover-hint">i</i>
          </span>
          <span className="text-darkone bg-accent rounded-lg w-20 ml-1 lg:ml-0 text-center mt-1">
          <a
            className="text-darkone bg-accent rounded-lg w-20 ml-1 lg:ml-0 text-center mt-1 flex items-center justify-center gap-1"
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
          <div
            className={`popover absolute w-[170px] top-full p-2 mt-1 border ${
              chainColors(dropdownSelectedChain).border
            } rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all`}
          >
            Base APR: {borrowAPR}
            {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
              ?.borrow && (
              <>
                <div className="flex pt-4">
                  <img
                    alt=""
                    className="size-4 rounded mr-1"
                    src="/img/ionic-sq.png"
                  />{' '}
                  +{' '}
                  {
                    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                      asset
                    ]?.borrow?.ionic
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
                {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                  ?.borrow?.mode && (
                  <>
                    <div className="flex">
                      <img
                        alt=""
                        className="size-4 mr-1"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
                      />{' '}
                      +{' '}
                      {
                        multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                          asset
                        ]?.borrow?.mode
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
                {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                  ?.borrow?.etherfi && (
                  <>
                    <div className="flex">
                      <img
                        alt=""
                        className="size-4 mr-1"
                        src="/images/etherfi.png"
                      />{' '}
                      +{' '}
                      {
                        multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                          asset
                        ]?.borrow?.etherfi
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
                {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                  ?.borrow?.kelp && (
                  <>
                    <div className="flex">
                      <img
                        alt=""
                        className="size-4 mr-1"
                        src="/images/kelpmiles.png"
                      />{' '}
                      +{' '}
                      {
                        multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[
                          asset
                        ]?.borrow?.kelp
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
                {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                  ?.borrow?.eigenlayer && (
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
        </div>
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          COLLATERAL FACTOR:
        </span>
        {collateralFactor}%
      </h3>
      <div className={` col-span-4 flex items-center justify-center gap-3`}>
        {address ? (
          <>
            <button
              className={`rounded-lg bg-accent text-black py-1.5 px-1 w-full h-full  uppercase`}
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
              className={`rounded-lg truncate w-full h-full ${
                chainColors(dropdownSelectedChain).bg
              } ${
                chainColors(dropdownSelectedChain).text
              } py-1.5 px-1 uppercase`}
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
          </>
        ) : (
          <div className="connect-button">
            <ConnectButton size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolRows;
