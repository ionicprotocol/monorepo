/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic';

import { pools } from '@ui/constants/index';
import { useRewardsBadge } from '@ui/hooks/useRewardsBadge';
import { multipliers } from '@ui/utils/multipliers';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

const Rewards = dynamic(() => import('./FlyWheelRewards'), {
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

  const showRewardsBadge = useRewardsBadge(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    'borrow',
    rewards
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
            {borrowConfig?.turtle && asset === 'STONE' && (
              <>
                <div className="flex">
                  <img
                    alt=""
                    className="size-4 mr-1"
                    src="/img/symbols/32/color/stone.png"
                  />{' '}
                  + Stone Turtle Points
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
