/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import { getAssetName } from '../../util/utils';
import ConnectButton from '../ConnectButton';
import { PopupMode } from '../popup/page';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

interface IRows {
  asset: string;
  borrowAPR: string;
  borrowBalance: string;
  collateralFactor: number;
  logo: string;
  loopPossible: boolean;
  membership: boolean;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  supplyAPR: string;
  supplyBalance: string;
  totalBorrowing: string;
  totalSupplied: string;
}
const PoolRows = ({
  asset,
  supplyBalance,
  totalSupplied,
  borrowBalance,
  collateralFactor,
  membership,
  totalBorrowing,
  supplyAPR,
  borrowAPR,
  logo,
  loopPossible,
  setSelectedSymbol,
  setPopupMode
}: IRows) => {
  const { address } = useMultiIonic();

  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-20  py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative ${
        membership && 'border border-lime'
      }`}
    >
      {membership && (
        <span className="absolute top-[-9px] right-[-15px] px-2 text-darkone bg-lime rounded-lg">
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
        <h3 className={` `}>{getAssetName(asset)}</h3>
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
          <span className="text-darkone bg-lime rounded-lg w-20 ml-1 lg:ml-0 text-center">
            + POINTS <i className="popover-hint">i</i>
          </span>
          <div className="popover absolute w-[150px] top-full p-2 mt-1 border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap">
            Base APR: {supplyAPR}
            <div className="flex pt-4">
              <img
                alt=""
                className="size-4 rounded mr-1"
                src="/img/ionic-sq.png"
              />{' '}
              + {/ezETH|weETH\.mode|STONE|wrsETH/gm.test(asset) && '2x'} Ionic
              Points
            </div>
            <div className="flex">
              <img
                alt=""
                className="size-4 mr-1"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
              />{' '}
              + {/ezETH|STONE|wrsETH/gm.test(asset) && '2x'}
              {/weETH\.mode/gm.test(asset) && '3x'} Mode Points
            </div>
            {asset === 'weETH.mode' && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/etherfi.png"
                />{' '}
                + {/weETH\.mode/gm.test(asset) && '3x'} ether.fi Points
              </div>
            )}
            {asset === 'ezETH' && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/renzo.png"
                />{' '}
                + 2x Renzo Points
              </div>
            )}
            {asset === 'wrsETH' && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/kelpmiles.png"
                />{' '}
                + 2x Kelp Miles
              </div>
            )}
            {(asset === 'ezETH' ||
              asset === 'weETH.mode' ||
              asset === 'wrsETH') && (
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
          <span className="text-darkone bg-lime rounded-lg w-20 ml-1 lg:ml-0 text-center">
            + POINTS <i className="popover-hint">i</i>
          </span>
          <div className="popover absolute w-[155px] top-full p-2 mt-1 border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
            Base APR: {borrowAPR}
            <div className="flex pt-4">
              <img
                alt=""
                className="size-4 rounded mr-1"
                src="/img/ionic-sq.png"
              />{' '}
              + {/ezETH|weETH|STONE|wrsETH/gm.test(asset) && '2x'} Ionic Points
            </div>
            <div className="flex">
              <img
                alt=""
                className="size-4 mr-1"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzM4OTZfMzU4MDcpIj4KPHBhdGggZD0iTTEyLjIzNTYgMC44MDAwNDlIMy43NjQ0NkwwLjgwMDA0OSAzLjc2NDQ1VjEyLjIzNTZMMy43NjQ0NiAxNS4ySDEyLjIzNTZMMTUuMiAxMi4yMzU2VjMuNzY0NDVMMTIuMjM1NiAwLjgwMDA0OVpNMTIuMzM3NyAxMS44Mzc0SDEwLjY0NjJWOC4wMTE5NkwxMS4zMjM1IDUuODMwMzVMMTAuODQzNiA1LjY2MDE4TDguNjQ4NDEgMTEuODM3NEg3LjM2MTkxTDUuMTY2NjggNS42NjAxOEw0LjY4Njc5IDUuODMwMzVMNS4zNjQwOCA4LjAxMTk2VjExLjgzNzRIMy42NzI1N1Y0LjE2MjY2SDYuMTkxMTJMNy43NTMzIDguNTU2NTFWOS44NDY0Mkg4LjI2MzgyVjguNTU2NTFMOS44MjYgNC4xNjI2NkgxMi4zNDQ1VjExLjgzNzRIMTIuMzM3N1oiIGZpbGw9IiNERkZFMDAiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zODk2XzM1ODA3Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo="
              />{' '}
              +{' '}
              {/ezETH|weETH|STONE|wrsETH/gm.test(asset) &&
                asset !== 'weETH.mode' &&
                '2x'}
              {/weETH\.mode/gm.test(asset) && '3x'} Mode Points
            </div>
            {(asset === 'weETH' || asset === 'weETH.mode') && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/etherfi.png"
                />{' '}
                + {/weETH\.mode/gm.test(asset) && '3x'} ether.fi Points
              </div>
            )}
            {asset === 'ezETH' && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/renzo.png"
                />{' '}
                + 2x Renzo Points
              </div>
            )}
            {asset === 'wrsETH' && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/kelpmiles.png"
                />{' '}
                + 2x Kelp Miles
              </div>
            )}
            {(asset === 'ezETH' ||
              asset === 'weETH' ||
              asset === 'wrsETH' ||
              asset === 'weETH.mode') && (
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
          COLLATERAL FACTOR:
        </span>
        {collateralFactor}%
      </h3>
      <div className={` col-span-4 flex items-center justify-center gap-3`}>
        {address ? (
          <>
            <button
              className={`rounded-lg bg-accent text-black py-1.5 px-3 uppercase`}
              onClick={() => {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.SUPPLY);
              }}
            >
              Supply / Withdraw
            </button>
            <button
              className={`rounded-lg bg-lime text-black py-1.5 px-3 uppercase`}
              onClick={() => {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.BORROW);
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
      {/* <Link
        href={`/market/details/${asset}`}
        className={` w-[50%] mx-auto col-span-2 flex lg:block justify-center items-center rounded-lg border text-white border-white py-1.5 `}
      >
        Details
      </Link> */}
    </div>
  );
};

export default PoolRows;
