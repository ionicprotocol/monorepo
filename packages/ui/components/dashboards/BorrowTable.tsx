import React from 'react';

import Image from 'next/image';

import { useChainId } from 'wagmi';

import { NO_COLLATERAL_SWAP, pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../../components/CommonTable';
import ActionButton from '../ActionButton';
import APR from '../markets/Cells/APR';
import TokenBalance from '../markets/Cells/TokenBalance';
import FlyWheelRewards from '../markets/FlyWheelRewards';

import type { EnhancedColumnDef } from '../../components/CommonTable';
import type { Address } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export interface BorrowRowData {
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

interface BorrowTableProps {
  data: BorrowRowData[];
  isLoading: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  setActiveTab: (value: 'borrow' | 'repay') => void;
  setSelectedSymbol: (value: string) => void;
  chain: number;
}

function BorrowTable({
  data,
  isLoading,
  setIsManageDialogOpen,
  setActiveTab,
  setSelectedSymbol,
  chain
}: BorrowTableProps) {
  const chainId = useChainId();
  const { address, getSdk } = useMultiIonic();
  const sdk = getSdk(chain);

  const columns: EnhancedColumnDef<BorrowRowData>[] = [
    {
      id: 'asset',
      header: <div className="pl-6">BORROW ASSETS</div>,
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
      header: 'BORROW APR',
      cell: ({ row }) => (
        <APR
          type="borrow"
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
          type="borrow"
        />
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2 pr-6">
          <ActionButton
            half
            action={async () => {
              const result = await handleSwitchOriginChain(
                row.original.selectedChain,
                chainId
              );
              if (result) {
                setSelectedSymbol(row.original.asset);
                setIsManageDialogOpen(true);
                setActiveTab('repay');
              }
            }}
            disabled={!address}
            label="Repay"
          />
          {!NO_COLLATERAL_SWAP[row.original.selectedChain]?.[
            row.original.pool
          ]?.includes(row.original.asset) && (
            <ActionButton
              half
              action={async () => {
                const result = await handleSwitchOriginChain(
                  row.original.selectedChain,
                  chainId
                );
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setIsManageDialogOpen(true);
                  setActiveTab('borrow');
                }
              }}
              disabled={
                !address ||
                !sdk?.chainDeployment[
                  `CollateralSwap-${row.original.comptrollerAddress}`
                ]
              }
              label="Borrow More"
              bg={pools[row.original.selectedChain].bg}
            />
          )}
        </div>
      )
    }
  ];

  return (
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
  );
}

export default BorrowTable;
