import { utils } from 'ethers';
import { useMemo } from 'react';

import { MarketData } from '../types/TokensDataMap';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useBorrowLimitTotal = (
  assets: MarketData[],
  poolChainId: number,
  options?: { ignoreIsEnabledCheckFor?: string }
): number => {
  const coingeckoId = useCgId(poolChainId);
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
