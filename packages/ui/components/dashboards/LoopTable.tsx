import React from 'react';

import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import type { MarketData } from '@ui/types/TokensDataMap';

import CommonTable from '../../components/CommonTable';
import ActionButton from '../ActionButton';
import LoopRewards from '../dashboards/LoopRewards';
import Loop from '../dialogs/loop';
import TokenBalance from '../markets/Cells/TokenBalance';
import TokenDisplay from '../TokenDisplay';

import type { EnhancedColumnDef } from '../../components/CommonTable';
import type { Address, Hex } from 'viem';

export interface LoopRowData {
  position: {
    address: Hex;
    collateral: {
      symbol: string;
      logo: string;
      amount: {
        tokens: number;
        usd: number;
      };
      underlyingDecimals: number;
    };
    borrowable: {
      symbol: string;
      logo: string;
      amount: {
        tokens: number;
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
      header: 'LOOPED ASSETS',
      width: '20%',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TokenDisplay
            tokens={[
              row.original.position.collateral.symbol,
              row.original.position.borrowable.symbol
            ]}
            tokenName={`${row.original.position.collateral.symbol}/${row.original.position.borrowable.symbol}`}
            size={28}
          />
          ({row.original.loops.toFixed(1)}x)
        </div>
      )
    },
    {
      id: 'value',
      header: 'LOOP VALUE',
      width: '20%',
      cell: ({ row }) => (
        <TokenBalance
          balance={row.original.position.collateral.amount.tokens}
          balanceUSD={row.original.position.collateral.amount.usd}
          tokenName={row.original.position.collateral.symbol}
        />
      )
    },
    {
      id: 'borrow',
      header: 'BORROW',
      width: '20%',
      cell: ({ row }) => (
        <TokenBalance
          balance={row.original.position.borrowable.amount.tokens}
          balanceUSD={row.original.position.borrowable.amount.usd}
          tokenName={row.original.position.borrowable.symbol}
        />
      )
    },
    // {
    //   id: 'loops',
    //   header: 'LOOPS',
    //   cell: ({ row }) => (
    //     <div className="mb-2 lg:mb-0">
    //       <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
    //         LOOPS:
    //       </span>
    //       <div>{row.original.loops.toFixed(1)}</div>
    //     </div>
    //   )
    // },
    {
      id: 'rewards',
      header: 'REWARDS',
      width: '20%',
      cell: ({ row }) => (
        <LoopRewards
          positionAddress={row.original.position.address}
          poolChainId={chain}
        />
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      width: '20%',
      cell: ({ row }) => (
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
