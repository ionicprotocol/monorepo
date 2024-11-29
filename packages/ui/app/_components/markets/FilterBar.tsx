'use client';

import dynamic from 'next/dynamic';

import { type MarketRowData } from '@ui/hooks/market/useMarketData';

import MarketSearch from './MarketSearch';

const PoolToggle = dynamic(
  () => import('../../_components/markets/PoolToggle'),
  {
    ssr: false
  }
);
interface FilterBarProps {
  chain: number;
  pool: string;
  marketData: MarketRowData[];
  onSearch: (filteredData: MarketRowData[]) => void;
}

export default function FilterBar({
  chain,
  pool,
  marketData,
  onSearch
}: FilterBarProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
        <PoolToggle
          chain={chain}
          pool={pool}
        />
      </div>
      <div className="w-full">
        <MarketSearch
          data={marketData}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
}
