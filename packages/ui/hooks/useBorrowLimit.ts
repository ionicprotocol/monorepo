import { NativePricedFuseAsset } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '../constants';

import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useBorrowLimit = <T extends NativePricedFuseAsset>(
  assets: T[],
  options?: { ignoreIsEnabledCheckFor?: string }
): number => {
  const { coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return useMemo(() => {
    if (!usdPrice) return 0;
    let _maxBorrow = 0;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (options?.ignoreIsEnabledCheckFor === asset.cToken || asset.membership) {
        _maxBorrow +=
          asset.supplyBalanceNative *
          parseFloat(utils.formatUnits(asset.collateralFactor, DEFAULT_DECIMALS)) *
          usdPrice;
      }
    }
    return _maxBorrow;
  }, [assets, options?.ignoreIsEnabledCheckFor, usdPrice]);
};
