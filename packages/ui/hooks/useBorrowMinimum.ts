import type { FuseAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

export const useBorrowMinimum = (asset: FuseAsset, poolChainId: number) => {
  const { currentSdk } = useMultiIonic();
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  const response = useQuery(
    [`useBorrowMinimum`, currentSdk?.chainId, asset.cToken],
    async () => {
      if (currentSdk) {
        return await currentSdk.contracts.FeeDistributor.callStatic
          .getMinBorrowEth(asset.cToken)
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
    {
      cacheTime: Infinity,
      enabled: !!currentSdk,
      staleTime: Infinity,
    }
  );

  const data = useMemo(() => {
    if (!response.data || !usdPrice) {
      return {
        minBorrowAsset: undefined,
        minBorrowNative: undefined,
        minBorrowUSD: undefined,
      };
    }

    return {
      minBorrowAsset: response.data
        .mul(utils.parseUnits('1', asset.underlyingDecimals))
        .div(asset.underlyingPrice),
      minBorrowNative: response.data,
      minBorrowUSD: Number(utils.formatUnits(response.data, 18)) * usdPrice,
    };
  }, [response, usdPrice, asset]);

  return {
    ...response,
    data,
  };
};
