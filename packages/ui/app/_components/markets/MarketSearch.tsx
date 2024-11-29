import React, { useCallback, useEffect, useState } from 'react';

import { Search } from 'lucide-react';
import { isAddress } from 'viem';

import { Input } from '@ui/components/ui/input';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';

const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface MarketSearchProps {
  data: MarketRowData[];
  onSearch: (filtered: MarketRowData[]) => void;
}

const MarketSearch = ({ data, onSearch }: MarketSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  const filterMarkets = useCallback(
    (term: string) => {
      if (!term.trim()) {
        onSearch(data);
        return;
      }

      const lowercaseSearch = term.toLowerCase();
      const isAddressSearch = isAddress(term);

      const filtered = data.filter((market) => {
        if (isAddressSearch) {
          return (
            market.cTokenAddress.toLowerCase() === lowercaseSearch ||
            market.underlyingToken.toLowerCase() === lowercaseSearch
          );
        }

        return (
          market.asset.toLowerCase().includes(lowercaseSearch) ||
          market.underlyingSymbol.toLowerCase().includes(lowercaseSearch)
        );
      });

      onSearch(filtered);
    },
    [data, onSearch]
  );

  useEffect(() => {
    filterMarkets(debouncedSearchTerm);
  }, [debouncedSearchTerm, filterMarkets]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-white/40" />
      </div>
      <Input
        placeholder="Search by token or address..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-9 pl-10 pr-4 rounded-lg text-sm border-white/5 hover:border-white/10 focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors placeholder:text-white/30"
      />
    </div>
  );
};

export default MarketSearch;
