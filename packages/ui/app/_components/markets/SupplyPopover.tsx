/* eslint-disable @next/next/no-img-element */
import { type FlywheelReward } from '@ionicprotocol/types';
import dynamic from 'next/dynamic';
import type { Address } from 'viem';
import { mode } from 'viem/chains';

const Rewards = dynamic(() => import('./Rewards'), {
  ssr: false
});

import { pools } from '@ui/constants/index';
import { multipliers } from '@ui/utils/multipliers';

type SupplyPopoverProps = {
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
  return (
    <>
      <span
        className={`  text-green-900 rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-3.5 px-1 ${
          multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
            ?.ionAPR
            ? 'bg-accent text-green-900 '
            : 'bg-accent/50 text-green-900'
        }`}
      >
        + ION APR <i className="popover-hint">i</i>
      </span>

      {multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.rewards && (
        <span
          className={`${pools[+dropdownSelectedChain].text} ${pools[+dropdownSelectedChain].bg} rounded-md w-max md:text-[10px] text-[8px] md:mb-1 ml-1 md:ml-0 text-center py-[1px] md:px-2.5 px-1`}
        >
          + REWARDS <i className="popover-hint">i</i>
        </span>
      )}
      {multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
        ?.turtle && (
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
      )}
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
        {multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.supply
          ?.spice && (
          <div className="flex">
            <img
              alt=""
              className="size-4 mr-1"
              src="/img/symbols/32/color/bob.png"
            />{' '}
            + Spice Points
          </div>
        )}
      </div>
    </>
  );
}
