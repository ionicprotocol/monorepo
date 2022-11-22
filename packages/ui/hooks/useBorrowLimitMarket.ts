import { utils } from 'ethers';
import { useMemo } from 'react';

import { MarketData } from '../types/TokensDataMap';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useBorrowLimitMarket = (
  asset: MarketData,
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
    return _maxBorrow;
  }, [assets, options?.ignoreIsEnabledCheckFor, usdPrice, asset.cToken]);
};
