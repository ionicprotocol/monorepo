import React, { useState } from 'react';

import Image from 'next/image';

import { useChainId } from 'wagmi';

import { NO_COLLATERAL_SWAP, pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../../components/CommonTable';
import ActionButton from '../ActionButton';
import CollateralSwapPopup from '../dashboards/CollateralSwapPopup';
import APR from '../markets/Cells/APR';
import TokenBalance from '../markets/Cells/TokenBalance';
import FlyWheelRewards from '../markets/FlyWheelRewards';

import type { EnhancedColumnDef } from '../../components/CommonTable';
import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export interface SupplyRowData {
  asset: string;
  logo: string;
  amount: {
    tokens: string;
    usd: number;
  };
  apr: {
    base: number;
    rewards: FlywheelReward[];
    total: number;
  };
  cToken: `0x${string}`;
  membership: boolean;
  comptrollerAddress: Address;
  pool: string;
  selectedChain: number;
  underlyingToken: string;
}

interface SupplyTableProps {
  data: SupplyRowData[];
  isLoading: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  setActiveTab: (value: 'supply' | 'withdraw') => void;
  setSelectedSymbol: (value: string) => void;
  allMarketData?: MarketData[];
  comptroller?: Address;
  pool: string;
}

function SupplyTable({
  data,
  isLoading,
  setIsManageDialogOpen,
  setActiveTab,
  setSelectedSymbol,
  allMarketData,
  comptroller,
  pool
}: SupplyTableProps) {
  const chainId = useChainId();
  const { address, getSdk } = useMultiIonic();
  const sdk = getSdk(chainId);

  // State for swap functionality
  const [swapFromAsset, setSwapFromAsset] = useState<MarketData>();
  const {
    componentRef: swapRef,
    isopen: swapOpen,
    toggle: swapToggle
  } = useOutsideClick();

  const columns: EnhancedColumnDef<SupplyRowData>[] = [
    {
      id: 'asset',
      header: 'SUPPLY ASSETS',
      cell: ({ row }) => (
        <div className="flex gap-3 items-center pl-6">
          <Image
            src={row.original.logo}
            alt={row.original.asset}
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <span>{row.original.asset}</span>
        </div>
      )
    },
    {
      id: 'amount',
      header: 'AMOUNT',
      cell: ({ row }) => (
        <TokenBalance
          balance={parseFloat(row.original.amount.tokens)}
          balanceUSD={row.original.amount.usd}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'apr',
      header: 'SUPPLY APR',
      cell: ({ row }) => (
        <APR
          type="supply"
          aprTotal={row.original.apr.total}
          baseAPR={row.original.apr.base}
          asset={row.original.asset}
          rewards={row.original.apr.rewards}
          dropdownSelectedChain={row.original.selectedChain}
          selectedPoolId={row.original.pool}
          cToken={row.original.cToken}
          pool={row.original.comptrollerAddress}
          underlyingToken={row.original.underlyingToken as `0x${string}`}
        />
      )
    },
    {
      id: 'rewards',
      header: 'REWARDS',
      cell: ({ row }) => (
        <FlyWheelRewards
          cToken={row.original.cToken}
          pool={row.original.comptrollerAddress}
          poolChainId={row.original.selectedChain}
          type="supply"
        />
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => {
        const marketAsset = allMarketData?.find(
          (asset) => asset.underlyingSymbol === row.original.asset
        );
        const canSwap = !NO_COLLATERAL_SWAP[row.original.selectedChain]?.[
          pool
        ]?.includes(row.original.asset);

        return (
          <div className="flex gap-2 pr-6">
            <ActionButton
              half={canSwap}
              action={async () => {
                const result = await handleSwitchOriginChain(
                  row.original.selectedChain,
                  chainId
                );
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setIsManageDialogOpen(true);
                  setActiveTab('supply');
                }
              }}
              disabled={!address}
              label="Manage"
            />
            {canSwap && marketAsset && (
              <ActionButton
                action={async () => {
                  const result = await handleSwitchOriginChain(
                    row.original.selectedChain,
                    chainId
                  );
                  if (result) {
                    setSwapFromAsset(marketAsset);
                    swapToggle();
                  }
                }}
                half
                disabled={
                  !sdk?.chainDeployment[`CollateralSwap-${comptroller}`]
                }
                label="Collateral Swap"
                bg={pools[row.original.selectedChain].bg}
              />
            )}
          </div>
        );
      }
    }
  ];

  return (
    <>
      {swapOpen && comptroller && swapFromAsset && (
        <CollateralSwapPopup
          toggler={swapToggle}
          swapRef={swapRef}
          swappedFromAsset={swapFromAsset}
          swappedToAssets={
            allMarketData?.filter(
              (asset) =>
                asset?.underlyingToken !== swapFromAsset?.underlyingToken &&
                !NO_COLLATERAL_SWAP[chainId]?.[pool]?.includes(
                  asset?.underlyingSymbol ?? ''
                )
            ) ?? []
          }
          swapOpen={swapOpen}
          comptroller={comptroller}
        />
      )}

      <CommonTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        getRowStyle={(row) => ({
          badge: row.original.membership ? { text: 'Collateral' } : undefined,
          borderClassName: row.original.membership
            ? pools[row.original.selectedChain]?.border
            : undefined
        })}
      />
    </>
  );
}

export default SupplyTable;
