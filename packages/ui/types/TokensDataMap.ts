import type { NativePricedFuseAsset, FusePoolData as SDKFusePoolData } from '@ionicprotocol/types';

export type MidasApiTokenData = {
  address: string;
  color: string;
  decimals: number;
  logoURL: string;
  name: string;
  overlayTextColor: string;
  symbol: string;
};

export type TokensDataMap = { [address: string]: MidasApiTokenData };

export interface MarketData extends NativePricedFuseAsset {
  borrowBalanceFiat: number;
  liquidityFiat: number;
  netSupplyBalanceFiat: number;
  supplyBalanceFiat: number;
  totalBorrowFiat: number;
  totalSupplyFiat: number;
}

export interface PoolData extends SDKFusePoolData {
  assets: MarketData[];
  totalAvailableLiquidityFiat: number;
  totalBorrowBalanceFiat: number;
  totalBorrowedFiat: number;
  totalCollateralSupplyBalanceFiat: number;
  totalLiquidityFiat: number;
  totalSuppliedFiat: number;
  totalSupplyBalanceFiat: number;
}
