import { NativePricedFuseAsset } from 'sdk';
import { useMemo } from 'react';

import { convertMantissaToAPR, convertMantissaToAPY } from '@ui/utils/apyUtils';

export const usePoolDetails = (assets: NativePricedFuseAsset[] | undefined) => {
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
          convertMantissaToAPY(asset.supplyRatePerBlock, 365) >
          convertMantissaToAPY(topLendingAPYAsset.supplyRatePerBlock, 365)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          convertMantissaToAPR(asset.borrowRatePerBlock) >
          convertMantissaToAPR(topBorrowAPRAsset.borrowRatePerBlock)
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
  }, [assets]);
};
