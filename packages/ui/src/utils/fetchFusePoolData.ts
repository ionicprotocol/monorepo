import { USDPricedFuseAsset } from '@midas-capital/sdk';

import { TokenData } from '@hooks/useTokenData';

export interface USDPricedFuseAssetWithTokenData extends USDPricedFuseAsset {
  tokenData: TokenData;
}

export enum FusePoolMetric {
  TotalLiquidityUSD,
  TotalSuppliedUSD,
  TotalBorrowedUSD,
}
