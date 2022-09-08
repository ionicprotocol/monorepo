import { FuseAsset, NativePricedFuseAsset } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

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

export const useMinBorrowNative = () => {
  const { midasSdk } = useMidas();

  return useQuery(
    [`useMinBorrowNative`, midasSdk.chainId],
    async () => {
      return midasSdk.contracts.FuseFeeDistributor.callStatic.minBorrowEth();
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!midasSdk.chainId,
    }
  );
};

export const useMinBorrowUsd = () => {
  const { coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const { data: minBorrowNative } = useMinBorrowNative();

  return useQuery(
    [`useMinBorrowUsd`, usdPrice, minBorrowNative],
    async () => {
      if (usdPrice && minBorrowNative) {
        const usdAmount = Number(utils.formatUnits(minBorrowNative)) * usdPrice;

        return usdAmount.toFixed(2);
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!minBorrowNative && !!usdPrice,
    }
  );
};

export const useAssetMinBorrow = (asset: FuseAsset) => {
  const { data: minBorrowNative } = useMinBorrowNative();
  return useMemo(() => {
    if (minBorrowNative) {
      return minBorrowNative
        .div(asset.underlyingPrice)
        .mul(utils.parseUnits('1', asset.underlyingDecimals));
    }
  }, [minBorrowNative, asset]);
};
