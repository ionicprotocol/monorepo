import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const usePoolDetails = (assets?: NativePricedFuseAsset[], poolChainId?: number) => {
  const { getSdk } = useMultiMidas();
  const sdk = useMemo(() => {
    if (poolChainId) return getSdk(poolChainId);
  }, [poolChainId, getSdk]);
  const blocksPerMinute = useMemo(() => {
    if (sdk) return getBlockTimePerMinuteByChainId(sdk.chainId);
  }, [sdk]);

  return useMemo(() => {
    if (assets && assets.length && sdk && blocksPerMinute) {
      let mostSuppliedAsset = assets[0];
      let topLendingAPYAsset = assets[0];
      let topBorrowAPRAsset = assets[0];
      assets.map((asset) => {
        if (asset.totalSupplyNative > mostSuppliedAsset.totalSupplyNative) {
          mostSuppliedAsset = asset;
        }
        if (
          sdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute) >
          sdk.ratePerBlockToAPY(topLendingAPYAsset.supplyRatePerBlock, blocksPerMinute)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          sdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute) >
          sdk.ratePerBlockToAPY(topBorrowAPRAsset.borrowRatePerBlock, blocksPerMinute)
        ) {
          topBorrowAPRAsset = asset;
        }
      });

      return {
        mostSuppliedAsset,
        topBorrowAPRAsset,
        topLendingAPYAsset,
      };
    } else {
      return null;
    }
  }, [assets, sdk, blocksPerMinute]);
};
