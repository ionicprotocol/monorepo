import { NativePricedFuseAsset } from 'sdk';
import { useMemo } from 'react';

import { useTokensData } from '@ui/hooks/useTokenData';
import {
  AssetHash,
  AssetsMapWithTokenDataReturn,
  NativePricedFuseAssetWithTokenData,
  TokensDataHash,
} from '@ui/types/ComponentPropsType';
import { createAssetsMap, createTokensDataMap } from '@ui/utils/tokenUtils';

export const useAssetsMap = (assetsArray: NativePricedFuseAsset[][] | null): AssetHash | null => {
  return useMemo(() => (assetsArray ? createAssetsMap(assetsArray) : null), [assetsArray]);
};

// This returns a Hashmap
export const useAssetsMapWithTokenData = (
  assetsArray: NativePricedFuseAsset[][] | null
): AssetsMapWithTokenDataReturn => {
  const assetsMap: AssetHash | null = useAssetsMap(assetsArray);
  const tokensAddresses: string[] = assetsMap ? Object.keys(assetsMap) : [];
  const tokensData = useTokensData(tokensAddresses);

  const tokensDataMap: TokensDataHash = useMemo(
    () => (tokensData ? createTokensDataMap(tokensData) : {}),
    [tokensData]
  );

  // Returns the original 2D assets Array but with tokenData filled in
  const assetsArrayWithTokenData: NativePricedFuseAssetWithTokenData[][] | null = useMemo(
    () =>
      assetsArray?.map((assets: NativePricedFuseAsset[]) =>
        assets.map((asset: NativePricedFuseAsset) => ({
          ...asset,
          tokenData: tokensDataMap[asset.underlyingToken],
        }))
      ) ?? null,
    [tokensDataMap, assetsArray]
  );

  return { assetsArrayWithTokenData, tokensDataMap };
};
