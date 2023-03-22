import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import type { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowLimitMarket = (
  asset: MarketData,
  assets: MarketData[],
  poolChainId: number,
  comptrollerAddress: string,
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
  const { data: borrowCaps } = useBorrowCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset,
  });

  return useQuery(
    [
      'useBorrowLimitMarket',
      poolChainId,
      asset,
      assets,
      options?.ignoreIsEnabledCheckFor,
      usdPrice,
      borrowCaps,
    ],
    async () => {
      if (!usdPrice) return undefined;

      let _maxBorrow = 0;

      for (let i = 0; i < assets.length; i++) {
        const currentAsset = assets[i];

        // Don't include and subtract current markets borrow
        if (currentAsset.cToken === asset.cToken) continue;

        if (options?.ignoreIsEnabledCheckFor === currentAsset.cToken || currentAsset.membership) {
          _maxBorrow +=
            currentAsset.supplyBalanceNative *
            parseFloat(utils.formatUnits(currentAsset.collateralFactor, DEFAULT_DECIMALS)) *
            usdPrice;
        }
      }

      return borrowCaps && borrowCaps.usdCap < _maxBorrow ? borrowCaps.usdCap : _maxBorrow;
    },
    { cacheTime: Infinity, enabled: !!usdPrice, staleTime: Infinity }
  );
};
