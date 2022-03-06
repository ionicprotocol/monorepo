import { USDPricedFuseAsset } from '@midas-capital/sdk';

import { TokenData } from '@hooks/useTokenData';

export interface AssetHash {
  [address: string]: USDPricedFuseAsset;
}
export interface TokensDataHash {
  [address: string]: TokenData;
}

export const createAssetsMap = (assetsArray: USDPricedFuseAsset[][]) => {
  const assetsMap: AssetHash = {};

  for (const assets of assetsArray) {
    for (const asset of assets) {
      const address = asset.underlyingToken;
      if (!assetsMap[address]) {
        assetsMap[address] = asset;
      }
    }
  }

  return assetsMap;
};

export const createTokensDataMap = (tokensData: TokenData[]): TokensDataHash => {
  const _tokensDataMap: TokensDataHash = {};

  for (const tokenData of tokensData) {
    if (!tokenData.address) continue;
    if (!_tokensDataMap[tokenData.address]) {
      _tokensDataMap[tokenData.address] = tokenData;
    }
  }

  return _tokensDataMap;
};
