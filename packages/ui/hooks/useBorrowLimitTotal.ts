import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowLimitTotal = (
  assets: MarketData[],
  poolChainId: number,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const coingeckoId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery(
    [
      'useBorrowLimitTotal',
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)),
      options?.ignoreIsEnabledCheckFor,
      usdPrice,
    ],
    () => {
      if (!usdPrice) return null;

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
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!usdPrice }
  );
};
