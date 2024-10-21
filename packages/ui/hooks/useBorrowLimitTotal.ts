import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowLimitTotal = (
  assets: MarketData[],
  poolChainId: number,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  return useQuery({
    queryKey: [
      'useBorrowLimitTotal',
      {
        assets
      },
      {
        ignoreIsEnabledCheckFor: !!options?.ignoreIsEnabledCheckFor
      },
      { usdPrice }
    ],

    queryFn: () => {
      if (!usdPrice) return undefined;

      let _maxBorrow = 0;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (
          options?.ignoreIsEnabledCheckFor === asset.cToken ||
          asset.membership
        ) {
          _maxBorrow +=
            asset.supplyBalanceNative *
            parseFloat(formatUnits(asset.collateralFactor, DEFAULT_DECIMALS)) *
            usdPrice;
        }
      }

      return _maxBorrow;
    },

    enabled: !!usdPrice,
    staleTime: Infinity
  });
};
