import { NativePricedFuseAsset } from '@midas-capital/types';
import { useMemo } from 'react';

import { useMidas } from '@ui/context/MidasContext';
import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';

export const usePoolDetails = (assets: NativePricedFuseAsset[] | undefined) => {
  const {
    midasSdk,
    currentChain: { id: chainId },
  } = useMidas();
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
          midasSdk.ratePerBlockToAPY(asset.supplyRatePerBlock, blocksPerMinute) >
          midasSdk.ratePerBlockToAPY(topLendingAPYAsset.supplyRatePerBlock, blocksPerMinute)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          midasSdk.ratePerBlockToAPY(asset.borrowRatePerBlock, blocksPerMinute) >
          midasSdk.ratePerBlockToAPY(topBorrowAPRAsset.borrowRatePerBlock, blocksPerMinute)
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
  }, [assets, midasSdk, blocksPerMinute]);
};
