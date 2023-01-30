import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowLimitMarket = (
  asset: MarketData,
  assets: MarketData[],
  poolChainId: number,
  comptrollerAddress: string,
  options?: { ignoreIsEnabledCheckFor?: string }
) => {
  const coingeckoId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const { data: borrowCaps } = useBorrowCap(
    comptrollerAddress,
    asset.cToken,
    asset.underlyingPrice,
    poolChainId
  );

  return useQuery(
    [
      'useBorrowLimitMarket',
      poolChainId,
      asset,
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)),
      options?.ignoreIsEnabledCheckFor,
      usdPrice,
      borrowCaps,
    ],
    async () => {
      if (!usdPrice) return null;

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
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!usdPrice }
  );
};
