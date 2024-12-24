import React from 'react';

import { formatUnits } from 'viem';
import { useChainId } from 'wagmi';

import { NO_COLLATERAL_SWAP } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import CommonTable from '../CommonTable';

import type { EnhancedColumnDef } from '../CommonTable';

import type { FlywheelReward } from '@ionicprotocol/types';

interface SupplyTableProps {
  suppliedAssets: MarketData[];
  assetsSupplyAprData: Record<string, { apy: number; totalApy: number }>;
  marketData?: {
    comptroller: `0x${string}`;
    assets: MarketData[];
  };
  rewards?: Record<string, FlywheelReward[]>;
  chain: number;
  pool: string;
  setSelectedSymbol: (symbol: string) => void;
  setActiveTab: (tab: 'borrow' | 'repay' | 'supply' | 'withdraw') => void;
  setIsManageDialogOpen: (isOpen: boolean) => void;
  setCollateralSwapFromAsset: (asset: MarketData) => void;
  swapToggle: () => void;
  isLoading: boolean;
}

const SupplyTable = ({
  suppliedAssets,
  assetsSupplyAprData,
  marketData,
  rewards,
  chain,
  pool,
  setSelectedSymbol,
  setActiveTab,
  setIsManageDialogOpen,
  setCollateralSwapFromAsset,
  swapToggle,
  isLoading
}: SupplyTableProps) => {
  const walletChain = useChainId();
  const { currentSdk } = useMultiIonic();

  const columns: EnhancedColumnDef<MarketData>[] = [
    {
      id: 'asset',
      header: 'SUPPLY ASSETS',
      sortingFn: 'alphabetical',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex gap-3 items-center pl-6">
            <img
              src={`/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`}
              alt={asset.underlyingSymbol}
              className="w-7 h-7"
            />
            <span>{asset.underlyingSymbol}</span>
          </div>
        );
      }
    },
    {
      id: 'amount',
      header: 'AMOUNT',
      sortingFn: 'numerical',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="text-right">
            <div>
              {asset.supplyBalanceNative
                ? Number.parseFloat(
                    formatUnits(asset.supplyBalance, asset.underlyingDecimals)
                  ).toLocaleString('en-US', { maximumFractionDigits: 2 })
                : '0'}{' '}
              {asset.underlyingSymbol}
            </div>
            <div className="text-sm text-white/60">
              $
              {asset.supplyBalanceFiat.toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        );
      }
    },
    {
      id: 'supplyApr',
      header: 'SUPPLY APR',
      sortingFn: 'numerical',
      cell: ({ row }) => {
        const asset = row.original;
        const baseApr = currentSdk
          ?.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            getBlockTimePerMinuteByChainId(chain)
          )
          .toFixed(2);

        const rewardsApr = rewards?.[asset.cToken]?.map((r) => ({
          ...r,
          apy: typeof r.apy !== 'undefined' ? r.apy * 100 : undefined
        }));

        return (
          <div className="text-right">
            <div>{baseApr}%</div>
            {rewardsApr && rewardsApr.length > 0 && (
              <div className="text-sm text-white/60">
                +
                {rewardsApr
                  .reduce((acc, r) => acc + (r.apy || 0), 0)
                  .toFixed(2)}
                % in rewards
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex gap-2">
            <button
              className="w-1/2 rounded-md bg-accent text-black py-2 px-3"
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  chain,
                  walletChain
                );
                if (result) {
                  setSelectedSymbol(asset.underlyingSymbol);
                  setActiveTab('supply');
                  setIsManageDialogOpen(true);
                }
              }}
            >
              Manage
            </button>
            {!NO_COLLATERAL_SWAP[chain]?.[pool]?.includes(
              asset.underlyingSymbol
            ) && (
              <button
                className="w-1/2 rounded-md bg-lime text-black py-2 px-3"
                onClick={async () => {
                  const result = await handleSwitchOriginChain(
                    chain,
                    walletChain
                  );
                  if (result) {
                    setCollateralSwapFromAsset(asset);
                    swapToggle();
                  }
                }}
              >
                Swap
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-grayone w-full px-6 py-3 rounded-xl">
      <div className="w-full flex items-center justify-between py-3">
        <h1 className="font-semibold">Your Collateral (Supply)</h1>
      </div>

      <CommonTable
        data={suppliedAssets}
        columns={columns}
        isLoading={isLoading}
        getRowStyle={(row) => ({
          badge: row.original.membership ? { text: 'Collateral' } : undefined,
          borderClassName: row.original.membership ? 'border-lime' : undefined
        })}
      />
    </div>
  );
};

export default SupplyTable;
