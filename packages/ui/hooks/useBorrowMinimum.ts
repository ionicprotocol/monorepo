import { FuseAsset } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useBorrowMinimum = (asset: FuseAsset) => {
  const { midasSdk, coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const response = useQuery(
    [`useBorrowMinimum`, midasSdk.chainId],
    async () => {
      return midasSdk.contracts.FuseFeeDistributor.callStatic.minBorrowEth();
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!midasSdk.chainId,
    }
  );

  const data = useMemo(() => {
    if (!response.data || !usdPrice) {
      return {
        minBorrowUSD: undefined,
        minBorrowNative: undefined,
        minBorrowAsset: undefined,
      };
    }

    return {
      minBorrowUSD: Number(utils.formatUnits(response.data, 18)) * usdPrice,
      minBorrowNative: response.data,
      minBorrowAsset: response.data
        .mul(utils.parseUnits('1', asset.underlyingDecimals))
        .div(asset.underlyingPrice),
    };
  }, [response, usdPrice, asset]);

  return {
    ...response,
    data,
  };
};
