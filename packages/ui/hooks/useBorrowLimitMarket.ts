import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowLimitMarket = (
  asset: MarketData,
  assets: MarketData[],
  poolChainId: number,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const coingeckoId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery(
    [
      'useBorrowLimitMarket',
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)).toString(),
      options?.ignoreIsEnabledCheckFor,
      usdPrice,
    ],
    async () => {
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
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!assets && !!poolChainId && !!usdPrice,
    }
  );
};
