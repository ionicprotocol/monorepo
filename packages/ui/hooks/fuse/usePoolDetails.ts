import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { useMemo } from 'react';

import { useRari } from '@ui/context/RariContext';
import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const usePoolDetails = (assets: NativePricedFuseAsset[] | undefined) => {
  const {
    fuse,
    currentChain: { id: chainId },
  } = useRari();
  const blocksPerMinute = useMemo(() => getBlockTimePerMinuteByChainId(chainId), [chainId]);

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
          fuse.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute) >
          fuse.ratePerBlockToAPY(topLendingAPYAsset.supplyRatePerBlock, blocksPerMinute)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          fuse.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute) >
          fuse.ratePerBlockToAPY(topBorrowAPRAsset.borrowRatePerBlock, blocksPerMinute)
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
  }, [assets, fuse, blocksPerMinute]);
};
