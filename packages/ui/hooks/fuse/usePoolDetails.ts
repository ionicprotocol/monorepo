import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const usePoolDetails = (
  assets?: NativePricedIonicAsset[],
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  const blocksPerMinute = useMemo(() => {
    if (sdk?.chainId) return getBlockTimePerMinuteByChainId(sdk.chainId);
  }, [sdk?.chainId]);

  return useQuery({
    queryKey: [
      'usePoolDetails',
      assets
        ?.sort((assetA, assetB) =>
          assetA.underlyingToken.localeCompare(assetB.underlyingToken)
        )
        .map(
          (asset) => (
            asset.totalSupplyNative,
            asset.supplyRatePerBlock,
            asset.borrowRatePerBlock
          )
        ),
      sdk?.chainId
    ],

    queryFn: async () => {
      if (assets && assets.length && sdk && blocksPerMinute) {
        try {
          let mostSuppliedAsset = assets[0];
          let topLendingAPYAsset = assets[0];
          let topBorrowAPRAsset = assets[0];
          assets.map((asset) => {
            if (asset.totalSupplyNative > mostSuppliedAsset.totalSupplyNative) {
              mostSuppliedAsset = asset;
            }
            if (
              sdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute) >
              sdk.ratePerBlockToAPY(
                topLendingAPYAsset.supplyRatePerBlock,
                blocksPerMinute
              )
            ) {
              topLendingAPYAsset = asset;
            }
            if (
              sdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute) >
              sdk.ratePerBlockToAPY(
                topBorrowAPRAsset.borrowRatePerBlock,
                blocksPerMinute
              )
            ) {
              topBorrowAPRAsset = asset;
            }
          });

          return {
            mostSuppliedAsset,
            topBorrowAPRAsset,
            topLendingAPYAsset
          };
        } catch (e) {
          console.warn(`Getting pool details error: `, { poolChainId }, e);
        }
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!assets && assets.length > 0 && !!sdk && !!blocksPerMinute,
    staleTime: Infinity
  });
};
