import { type Address } from 'viem';
import { base, mode } from 'viem/chains';

import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import type { MarketData } from '@ui/types/TokensDataMap';

export const getAssetName = (asset: string, chain: number): string =>
  asset === 'weETH' && chain === mode.id
    ? 'weETH (OLD)'
    : asset === 'weETH.mode' && chain === base.id
      ? 'weETH'
      : asset;

export function useGetMaxBorrow(
  selectedMarketD: MarketData,
  caddress: Address,
  chain: number
) {
  const { data: maxBorrowAmount } = useMaxBorrowAmount(
    selectedMarketD,
    caddress,
    chain
  );

  return maxBorrowAmount?.number;
}
