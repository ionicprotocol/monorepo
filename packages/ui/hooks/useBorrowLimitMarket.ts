import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useUsdPrice } from './useUsdPrices';

import type { Address } from 'viem';

export const useBorrowLimitMarket = (
  asset: MarketData,
  assets: MarketData[],
  poolChainId: number,
  comptrollerAddress: Address,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const { data: usdPrice } = useUsdPrice(poolChainId);
  const { data: borrowCaps } = useBorrowCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset
  });

  return useQuery({
    queryKey: [
      'useBorrowLimitMarket',
      poolChainId,
      asset,
      assets,
      options?.ignoreIsEnabledCheckFor,
      usdPrice,
      borrowCaps
    ],

    queryFn: () => {
      if (!usdPrice) return undefined;

      let _maxBorrow = 0;

      for (let i = 0; i < assets.length; i++) {
        const currentAsset = assets[i];

        // Don't include and subtract current markets borrow
        if (currentAsset.cToken === asset.cToken) continue;

        if (
          options?.ignoreIsEnabledCheckFor === currentAsset.cToken ||
          currentAsset.membership
        ) {
          _maxBorrow +=
            currentAsset.supplyBalanceNative *
            parseFloat(
              formatUnits(currentAsset.collateralFactor, DEFAULT_DECIMALS)
            ) *
            usdPrice;
        }
      }

      return borrowCaps && borrowCaps.usdCap < _maxBorrow
        ? borrowCaps.usdCap
        : _maxBorrow;
    },

    enabled: !!usdPrice,
    staleTime: Infinity
  });
};
