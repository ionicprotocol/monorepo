'use client';

import dynamic from 'next/dynamic';

import { type MarketRowData } from '@ui/hooks/market/useMarketData';

import MarketSearch from './MarketSearch';
import CommonTable from '../CommonTable';

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
  filteredData: MarketRowData[];
  columns: any[];
  isLoading: boolean;
}

export default function FilterBar({
  chain,
  pool,
  marketData,
  onSearch,
  filteredData,
  columns,
  isLoading
}: FilterBarProps) {
  return (
    <div className="bg-grayone w-full rounded-xl py-4 px-4 lg:px-[1%] xl:px-[3%]">
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

      <CommonTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
      />
    </div>
  );
}
