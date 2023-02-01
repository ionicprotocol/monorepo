import { FuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';

export const useBorrowMinimum = (asset: FuseAsset, poolChainId: number) => {
  const { currentSdk } = useMultiMidas();
  const { data: usdPrice } = useNativePriceInUSD(poolChainId);

  const response = useQuery(
    [`useBorrowMinimum`, currentSdk?.chainId, asset.cToken],
    async () => {
      if (currentSdk) {
        return await currentSdk.contracts.FuseFeeDistributor.callStatic.getMinBorrowEth(
          asset.cToken
        );
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!currentSdk,
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
