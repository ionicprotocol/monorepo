import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { useMemo } from 'react';

import { useRari } from '@ui/context/RariContext';
import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const usePoolDetails = (assets: NativePricedFuseAsset[] | undefined) => {
  const { currentChain, fuse } = useRari();
  return useMemo(() => {
    if (assets && assets.length) {
      let mostSuppliedAsset = assets[0];
      let topLendingAPYAsset = assets[0];
      let topBorrowAPRAsset = assets[0];
      assets.map((asset) => {
        if (asset.totalSupplyNative > mostSuppliedAsset.totalSupplyNative) {
          mostSuppliedAsset = asset;
        }
        if (
          fuse.convertMantissaToAPY(
            asset.supplyRatePerBlock,
            getBlockTimePerMinuteByChainId(currentChain.id),
            365
          ) >
          fuse.convertMantissaToAPY(
            topLendingAPYAsset.supplyRatePerBlock,
            getBlockTimePerMinuteByChainId(currentChain.id),
            365
          )
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          fuse.convertMantissaToAPR(
            asset.borrowRatePerBlock,
            getBlockTimePerMinuteByChainId(currentChain.id)
          ) >
          fuse.convertMantissaToAPR(
            topBorrowAPRAsset.borrowRatePerBlock,
            getBlockTimePerMinuteByChainId(currentChain.id)
          )
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
  }, [assets, fuse, currentChain.id]);
};
