/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic';

import { pools } from '@ui/constants/index';
import { hasAdditionalRewards, multipliers } from '@ui/utils/multipliers';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

const Rewards = dynamic(() => import('./Rewards'), {
  ssr: false
});

export type BorrowPopoverProps = {
  dropdownSelectedChain: number;
  borrowAPR?: number;
  rewardsAPR?: number;
  selectedPoolId: string;
  asset: string;
  cToken: Address;
  pool: Address;
  rewards?: FlywheelReward[];
};
export default function BorrowPopover({
  dropdownSelectedChain,
  borrowAPR,
  rewards,
  selectedPoolId,
  asset,
  cToken,
  pool
}: BorrowPopoverProps) {
  const isModeMarket =
    dropdownSelectedChain === 34443 && (asset === 'USDC' || asset === 'WETH');

  const borrowConfig =
    multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.borrow;

  const showRewardsBadge = hasAdditionalRewards(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    'borrow'
  );

  return (
    <>
      <span
        className={`rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-1 lg:px-3.5 px-1 ${
          borrowConfig?.ionAPR
            ? 'bg-accent text-green-900 '
            : 'bg-accent/50 text-green-900 '
        }`}
      >
        + ION APR <i className="popover-hint">i</i>
      </span>

      {showRewardsBadge && !isModeMarket && (
        <span
          className={`${pools[+dropdownSelectedChain].text} ${pools[+dropdownSelectedChain].bg} rounded-md w-max lg:text-[10px] md:text-[9px] text-[8px] md:mb-1 py-[1px] md:px-1 lg:px-2.5 px-1 ml-1 md:ml-0 text-center`}
        >
          + REWARDS <i className="popover-hint">i</i>
        </span>
      )}

      {borrowConfig?.turtle && !isModeMarket && (
        <span className="text-darkone rounded-md w-max md:ml-0 text-center ">
          <a
            className="text-darkone bg-white rounded-md w-max ml-1 md:ml-0 text-center py-[1px] md:px-1 lg:px-3.5 px-1 flex items-center justify-center gap-1 md:text-[10px] text-[8px]"
            href="https://turtle.club/dashboard/?ref=IONIC"
            target="_blank"
            rel="noreferrer"
          >
            + TURTLE{' '}
            <img
              alt="external-link"
              className="w-3 h-3"
              src="https://img.icons8.com/material-outlined/24/external-link.png"
            />
          </a>
        </span>
      )}
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
        {borrowConfig && (
          <>
            {borrowConfig?.flywheel && (
              <Rewards
                cToken={cToken}
                pool={pool}
                poolChainId={dropdownSelectedChain}
                type="borrow"
                rewards={rewards}
              />
            )}
            {borrowConfig?.ionic > 0 && (
              <>
                <div className="flex ">
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
              </>
            )}

            {Boolean(
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.borrow?.mode
            ) &&
              asset !== 'USDC' &&
              asset !== 'WETH' && (
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
            {borrowConfig?.etherfi && (
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
            {borrowConfig?.kelp && (
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
            {borrowConfig?.eigenlayer && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/images/eigen.png"
                />{' '}
                + EigenLayer Points
              </div>
            )}
            {borrowConfig?.spice && (
              <div className="flex">
                <img
                  alt=""
                  className="size-4 mr-1"
                  src="/img/symbols/32/color/bob.png"
                />{' '}
                + Spice Points
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
