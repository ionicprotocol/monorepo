import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useBorrowAPYs = (assets: MarketData[], chainId?: number) => {
  const sdk = useSdk(chainId);
  const data = useMemo(() => {
    if (!sdk || !assets || !chainId) return null;

    const result: { [market: string]: number } = {};

    for (const asset of assets) {
      const marketBorrowApy =
        sdk.ratePerBlockToAPY(asset.borrowRatePerBlock, getBlockTimePerMinuteByChainId(chainId)) /
        100;

      result[asset.cToken] = marketBorrowApy;
    }

    return result;
  }, [assets, chainId, sdk]);
  return { data };
};
