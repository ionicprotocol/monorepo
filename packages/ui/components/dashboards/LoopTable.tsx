import React from 'react';

import Image from 'next/image';

import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import type { MarketData } from '@ui/types/TokensDataMap';

import CommonTable from '../../components/CommonTable';
import ActionButton from '../ActionButton';
import LoopRewards from '../dashboards/LoopRewards';
import Loop from '../dialogs/loop';
import TokenBalance from '../markets/Cells/TokenBalance';

import type { EnhancedColumnDef } from '../../components/CommonTable';
import type { Address, Hex } from 'viem';

export interface LoopRowData {
  position: {
    address: Hex;
    collateral: {
      symbol: string;
      logo: string;
      amount: {
        tokens: string;
        usd: number;
      };
      underlyingDecimals: number;
    };
    borrowable: {
      symbol: string;
      logo: string;
      amount: {
        tokens: string;
        usd: number;
      };
      underlyingDecimals: number;
    };
  };
  loops: number;
}

interface LoopTableProps {
  data: LoopRowData[];
  isLoading: boolean;
  setSelectedSymbol: (value: string) => void;
  setSelectedLoopBorrowData: (asset?: MarketData) => void;
  setLoopOpen: (open: boolean) => void;
  chain: number;
  marketData?: MarketData[];
  loopOpen: boolean;
  loopData?: LoopMarketData;
  selectedMarketData?: MarketData;
  comptroller?: Address;
  selectedLoopBorrowData?: MarketData;
}

function LoopTable({
  data,
  isLoading,
  setSelectedSymbol,
  setSelectedLoopBorrowData,
  setLoopOpen,
  chain,
  marketData,
  loopOpen,
  loopData,
  selectedMarketData,
  comptroller,
  selectedLoopBorrowData
}: LoopTableProps) {
  const columns: EnhancedColumnDef<LoopRowData>[] = [
    {
      id: 'assets',
      header: <div className="pl-6">LOOPED ASSETS</div>,
      cell: ({ row }) => (
        <div className="flex gap-3 items-center pl-6">
          <Image
            src={row.original.position.collateral.logo}
            alt={row.original.position.collateral.symbol}
            width={28}
            height={28}
            className="h-7"
          />
          <span>{row.original.position.collateral.symbol}</span>
          /
          <Image
            src={row.original.position.borrowable.logo}
            alt={row.original.position.borrowable.symbol}
            width={28}
            height={28}
            className="h-7"
          />
          <span>{row.original.position.borrowable.symbol}</span>
        </div>
      )
    },
    {
      id: 'value',
      header: 'LOOP VALUE',
      cell: ({ row }) => (
        <div className="mb-2 lg:mb-0">
          <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
            POSITION VALUE:
          </span>
          <TokenBalance
            balance={parseFloat(row.original.position.collateral.amount.tokens)}
            balanceUSD={row.original.position.collateral.amount.usd}
            tokenName={row.original.position.collateral.symbol}
          />
        </div>
      )
    },
    {
      id: 'borrow',
      header: 'BORROW',
      cell: ({ row }) => (
        <div className="mb-2 lg:mb-0">
          <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
            BORROW:
          </span>
          <TokenBalance
            balance={parseFloat(row.original.position.borrowable.amount.tokens)}
            balanceUSD={row.original.position.borrowable.amount.usd}
            tokenName={row.original.position.borrowable.symbol}
          />
        </div>
      )
    },
    {
      id: 'loops',
      header: 'LOOPS',
      cell: ({ row }) => (
        <div className="mb-2 lg:mb-0">
          <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
            LOOPS:
          </span>
          <div>{row.original.loops.toFixed(1)}</div>
        </div>
      )
    },
    {
      id: 'rewards',
      header: 'REWARDS',
      cell: ({ row }) => (
        <LoopRewards
          positionAddress={row.original.position.address}
          poolChainId={chain}
          className="items-center justify-center"
        />
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="ml-2 mb-2 lg:mb-0">
          <ActionButton
            action={() => {
              setSelectedLoopBorrowData(
                marketData?.find(
                  (asset) =>
                    asset.underlyingSymbol ===
                    row.original.position.borrowable.symbol
                )
              );
              setSelectedSymbol(row.original.position.collateral.symbol);
              setLoopOpen(true);
            }}
            label="Adjust / Close"
            bg="bg-accent"
          />
        </div>
      )
    }
  ];

  return (
    <>
      <CommonTable
        data={data}
        columns={columns}
        isLoading={isLoading}
      />

      {selectedMarketData && (
        <Loop
          borrowableAssets={loopData ? loopData[selectedMarketData.cToken] : []}
          isOpen={loopOpen}
          setIsOpen={setLoopOpen}
          comptrollerAddress={comptroller ?? '0x'}
          currentBorrowAsset={selectedLoopBorrowData}
          selectedCollateralAsset={selectedMarketData}
        />
      )}
    </>
  );
}

export default LoopTable;
