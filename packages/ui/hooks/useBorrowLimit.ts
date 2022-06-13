import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useBorrowLimit = <T extends NativePricedFuseAsset>(
  assets: T[],
  options?: { ignoreIsEnabledCheckFor?: string }
): number => {
  const { coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return useMemo(() => {
    if (!usdPrice) return 0;
    let _maxBorrow = 0;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (options?.ignoreIsEnabledCheckFor === asset.cToken || asset.membership) {
        _maxBorrow +=
          asset.supplyBalanceNative *
          parseFloat(utils.formatUnits(asset.collateralFactor, asset.underlyingDecimals)) *
          usdPrice;
      }
    }
    return _maxBorrow;
  }, [assets, options?.ignoreIsEnabledCheckFor, usdPrice]);
};
