import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useMemo } from 'react';

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

  return useQuery(
    [
      'useBorrowLimitTotal',
      {
        assets
      },
      {
        ignoreIsEnabledCheckFor: !!options?.ignoreIsEnabledCheckFor
      },
      { usdPrice }
    ],
    () => {
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
            parseFloat(
              utils.formatUnits(asset.collateralFactor, DEFAULT_DECIMALS)
            ) *
            usdPrice;
        }
      }

      return _maxBorrow;
    },
    { cacheTime: Infinity, enabled: !!usdPrice, staleTime: Infinity }
  );
};
