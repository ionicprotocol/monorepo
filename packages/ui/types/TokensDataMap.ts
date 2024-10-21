import { type Address } from 'viem';

import type {
  NativePricedIonicAsset,
  IonicPoolData as SDKFusePoolData
} from '@ionicprotocol/types';

export type IonicApiTokenData = {
  address: Address;
  color: string;
  decimals: number;
  logoURL: string;
  name: string;
  overlayTextColor: string;
  symbol: string;
};

export type TokensDataMap = { [address: Address]: IonicApiTokenData };

export interface MarketData extends NativePricedIonicAsset {
  borrowBalanceFiat: number;
  exchangeRate: bigint;
  liquidityFiat: number;
  netSupplyBalanceFiat: number;
  supplyBalanceFiat: number;
  totalBorrowFiat: number;
  totalSupplyFiat: number;
  rewardsInfo?: {
    rewardToken: Address;
    flywheel: Address;
  }[];
}

export interface PoolData extends SDKFusePoolData {
  assets: MarketData[];
  totalAvailableLiquidityFiat: number;
  totalBorrowBalanceFiat: number;
  totalBorrowedFiat: number;
  totalLiquidityFiat: number;
  totalSuppliedFiat: number;
  totalSupplyBalanceFiat: number;
}
