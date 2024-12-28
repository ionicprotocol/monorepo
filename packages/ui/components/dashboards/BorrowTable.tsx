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
import TokenDisplay from '../TokenDisplay';

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
      header: 'BORROW ASSETS',
      width: '20%',
      cell: ({ row }) => (
        <TokenDisplay
          tokens={[row.original.asset]}
          tokenName={row.original.asset}
          size={28}
        />
      )
    },
    {
      id: 'amount',
      header: 'AMOUNT',
      width: '20%',
      cell: ({ row }) => (
        <TokenBalance
          balance={Number(row.original.amount.tokens)}
          balanceUSD={row.original.amount.usd}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'apr',
      header: 'BORROW APR',
      width: '20%',
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
      width: '20%',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <FlyWheelRewards
            cToken={row.original.cToken}
            pool={row.original.comptrollerAddress}
            poolChainId={row.original.selectedChain}
            type="borrow"
            standalone
          />
        </div>
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      width: '20%',
      enableSorting: false,
      cell: ({ row }) => (
        <ActionButton
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
          label="Manage"
          className="pr-6"
        />
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
