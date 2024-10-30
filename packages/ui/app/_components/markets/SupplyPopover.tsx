import dynamic from 'next/dynamic';
import Link from 'next/link';

import { pools } from '@ui/constants/index';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import { useRewardsBadge } from '@ui/hooks/useRewardsBadge';
import { multipliers } from '@ui/utils/multipliers';

import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

const Rewards = dynamic(() => import('./FlyWheelRewards'), {
  ssr: false
});

export type SupplyPopoverProps = {
  asset: string;
  cToken: Address;
  dropdownSelectedChain: number;
  pool: Address;
  selectedPoolId: string;
  supplyAPR?: number;
  rewards?: FlywheelReward[];
};

export default function SupplyPopover({
  asset,
  cToken,
  dropdownSelectedChain,
  pool,
  selectedPoolId,
  supplyAPR,
  rewards
}: SupplyPopoverProps) {
  const isMainModeMarket =
    dropdownSelectedChain === 34443 &&
    (asset === 'USDC' || asset === 'WETH') &&
    selectedPoolId === '0';

  const { data: merklApr } = useMerklApr();

  const merklAprForToken = merklApr?.find(
    (a) => Object.keys(a)[0].toLowerCase() === cToken.toLowerCase()
  )?.[cToken];

  const supplyConfig =
    multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply;

  const showRewardsBadge = useRewardsBadge(
    dropdownSelectedChain,
    selectedPoolId,
    asset,
    'supply',
    rewards
  );

  return (
    <>
      <span
        className={`text-green-900 rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-1 lg:px-3.5 px-1 ${
          multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
            ?.ionAPR
            ? 'bg-accent text-green-900 '
            : 'bg-accent/50 text-green-900'
        }`}
      >
        + ION APR <i className="popover-hint">i</i>
      </span>

      {/* Rewards Badge */}
      {showRewardsBadge && (
        <span
          className={`${pools[+dropdownSelectedChain].text} ${pools[+dropdownSelectedChain].bg} rounded-md w-max lg:text-[10px] md:text-[9px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-1 lg:px-2.5 px-1 flex items-center justify-center`}
        >
          {isMainModeMarket ? (
            <>
              +{' '}
              <img
                src="/images/op-logo-red.svg"
                alt="OP"
                className="inline-block w-3 h-3 mx-[2px]"
              />{' '}
              REWARDS{' '}
            </>
          ) : (
            '+ REWARDS '
          )}
          <i className="popover-hint mb-[-2px] ml-[2px]">i</i>
        </span>
      )}

      {supplyConfig?.turtle && !isMainModeMarket && (
        <span className="text-darkone rounded-md w-max md:ml-0 text-center">
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
        className={`popover absolute min-w-[190px] top-full p-2 px-2 mt-1 border ${pools[dropdownSelectedChain].border} rounded-md text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all whitespace-nowrap`}
      >
        <div className="flex items-center justify-between">
          <span>
            Base APR: +
            {typeof supplyAPR !== 'undefined'
              ? supplyAPR.toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '-'}
            %
          </span>
        </div>
        {isMainModeMarket && (
          <div className="flex items-center mt-1">
            <img
              src="/images/op-logo-red.svg"
              alt="OP"
              className="w-4 h-4 mr-1"
            />
            <Link
              target="_blank"
              href="https://app.merkl.xyz/?chain=34443"
              className="text-white underline"
            >
              + OP Rewards:{' '}
              {merklAprForToken?.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              %
            </Link>
          </div>
        )}
        <p>
          {supplyConfig?.underlyingAPR &&
            `Native Asset Yield: +${multipliers[dropdownSelectedChain]?.[
              selectedPoolId
            ]?.[asset]?.supply?.underlyingAPR?.toLocaleString('en-US', {
              maximumFractionDigits: 2
            })}%`}
        </p>
        {supplyConfig?.flywheel && (
          <Rewards
            cToken={cToken}
            pool={pool}
            poolChainId={dropdownSelectedChain}
            type="supply"
            rewards={rewards}
          />
        )}
        {(supplyConfig?.ionic ?? 0) > 0 && (
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
        {(supplyConfig?.anzen ?? 0) > 0 && (
          <div className="flex mt-1">
            <img
              alt=""
              className="size-4 rounded mr-1"
              src="/img/symbols/32/color/usdz.png"
            />{' '}
            +{' '}
            {
              multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]
                ?.supply?.anzen
            }
            x Anzen Points
          </div>
        )}
        {supplyConfig?.turtle && asset === 'STONE' && (
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
        {supplyConfig?.etherfi && (
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
          </>
        )}
        {supplyConfig?.renzo && (
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
        {supplyConfig?.kelp && (
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
        {supplyConfig?.eigenlayer && (
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/images/eigen.png"
            />{' '}
            + EigenLayer Points
          </div>
        )}
        {supplyConfig?.spice && (
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/img/symbols/32/color/bob.png"
            />{' '}
            + Spice Points
          </div>
        )}
        {supplyConfig?.nektar && (
          <div className="flex mt-1">
            <img
              alt=""
              className="size-4 mr-1"
              src="/img/symbols/32/color/nektar.png"
            />{' '}
            + Nektar Points
          </div>
        )}
      </div>
    </>
  );
}
