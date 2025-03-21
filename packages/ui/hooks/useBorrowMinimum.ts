import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { formatUnits, parseUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useUsdPrice } from './useUsdPrices';

import type { IonicAsset } from '@ionicprotocol/types';

export const useBorrowMinimum = (asset: IonicAsset, poolChainId: number) => {
  const { currentSdk } = useMultiIonic();
  const { data: usdPrice } = useUsdPrice(poolChainId);

  const response = useQuery({
    queryKey: [`useBorrowMinimum`, currentSdk?.chainId, asset.cToken],

    queryFn: async () => {
      if (currentSdk) {
        return await currentSdk.contracts.FeeDistributor.read
          .getMinBorrowEth([asset.cToken])
          .catch((e) => {
            console.warn(
              `Getting min borrow eth error: `,
              { cToken: asset.cToken, poolChainId },
              e
            );

            return null;
          });
      } else {
        return null;
      }
    },

    enabled: !!currentSdk,
    staleTime: Infinity
  });

  const data = useMemo(() => {
    if (!response.data || !usdPrice) {
      return {
        minBorrowAsset: undefined,
        minBorrowNative: undefined,
        minBorrowUSD: undefined
      };
    }

    return {
      minBorrowAsset:
        (response.data * parseUnits('1', asset.underlyingDecimals)) /
        asset.underlyingPrice,
      minBorrowNative: response.data,
      minBorrowUSD: Number(formatUnits(response.data, 18)) * usdPrice
    };
  }, [response, usdPrice, asset]);

  return {
    ...response,
    data
  };
};
