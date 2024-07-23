'use client';

import { type Address } from 'viem';

import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

interface IBorrow {
  selectedMarketData: MarketData;
  comptrollerAddress: Address;
  chain: number;
}
export default function BorrowAmount({
  selectedMarketData,
  comptrollerAddress,
  chain
}: IBorrow) {
  const { data: maxBorrowAmount, isLoading: isLoadingMaxBorrowAmount } =
    useMaxBorrowAmount(selectedMarketData, comptrollerAddress, chain);

  return (
    <span>
      {!isLoadingMaxBorrowAmount
        ? maxBorrowAmount?.number?.toLocaleString('en-US', {
            maximumFractionDigits: 7
          })
        : '0'}
    </span>
  );
}
