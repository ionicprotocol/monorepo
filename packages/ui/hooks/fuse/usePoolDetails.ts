import { NativePricedFuseAsset } from '@midas-capital/types';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const usePoolDetails = (assets: NativePricedFuseAsset[] | undefined) => {
  const { currentSdk, currentChain } = useMultiMidas();
  const blocksPerMinute = useMemo(
    () => currentChain && getBlockTimePerMinuteByChainId(currentChain.id),
    [currentChain]
  );

  return useMemo(() => {
    if (assets && assets.length && currentSdk && blocksPerMinute) {
      let mostSuppliedAsset = assets[0];
      let topLendingAPYAsset = assets[0];
      let topBorrowAPRAsset = assets[0];
      assets.map((asset) => {
        if (asset.totalSupplyNative > mostSuppliedAsset.totalSupplyNative) {
          mostSuppliedAsset = asset;
        }
        if (
          currentSdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute) >
          currentSdk.ratePerBlockToAPY(topLendingAPYAsset.supplyRatePerBlock, blocksPerMinute)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          currentSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute) >
          currentSdk.ratePerBlockToAPY(topBorrowAPRAsset.borrowRatePerBlock, blocksPerMinute)
        ) {
          topBorrowAPRAsset = asset;
        }
      });

      return {
        mostSuppliedAsset,
        topLendingAPYAsset,
        topBorrowAPRAsset,
      };
    } else {
      return null;
    }
  }, [assets, currentSdk, blocksPerMinute]);
};
