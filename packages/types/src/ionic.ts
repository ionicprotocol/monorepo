import { Address } from "viem";

export interface IonicAsset {
  cToken: Address;
  plugin?: Address;

  /** scaled by `underlying.decimals()`  */
  borrowBalance: bigint;
  /** scaled by `underlying.decimals()`  */
  supplyBalance: bigint;

  /** scaled by `underlying.decimals()`  */
  liquidity: bigint;
  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: Address;
  underlyingDecimals: number;

  /** scaled by `1e18` */
  underlyingPrice: bigint;

  /** scaled by `underlying.decimals()`  */
  underlyingBalance: bigint;

  /** scaled by `1e18` */
  collateralFactor: bigint;
  /** scaled by `1e18` */
  reserveFactor: bigint;

  adminFee: bigint;
  ionicFee: bigint;

  borrowRatePerBlock: bigint;
  supplyRatePerBlock: bigint;

  /** scaled by `underlying.decimals()`  */
  totalBorrow: bigint;
  /** scaled by `underlying.decimals()`  */
  totalSupply: bigint;

  isBorrowPaused: boolean;
  isSupplyPaused: boolean;
}

export interface NativePricedIonicAsset extends IonicAsset {
  supplyBalanceNative: number;
  borrowBalanceNative: number;

  totalSupplyNative: number;
  totalBorrowNative: number;

  liquidityNative: number;
  utilization: number;

  extraDocs?: string;
  exchangeRate: bigint;

  borrowGuardianPaused: boolean;
  mintGuardianPaused: boolean;

  logoUrl?: string;
  originalSymbol?: string;

  netSupplyBalance: bigint;
  netSupplyBalanceNative: number;
}

export interface IonicPoolData {
  id: number;
  chainId: number;
  assets: NativePricedIonicAsset[];
  creator: Address;
  comptroller: Address;
  name: string;
  totalLiquidityNative: number;
  totalAvailableLiquidityNative: number;

  /** scaled by `1e18` */
  totalSuppliedNative: number;
  /** scaled by `1e18` */
  totalBorrowedNative: number;

  totalSupplyBalanceNative: number;
  totalCollateralSupplyBalanceNative: number;
  totalBorrowBalanceNative: number;
  blockPosted: bigint;
  timestampPosted: bigint;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  utilization: number;
}

export interface IonicPool {
  name: string;
  creator: Address;
  comptroller: Address;
  blockPosted: number;
  timestampPosted: number;
}

export interface AssetPrice {
  usdPrice: number;
  underlyingPrice: number;
  createdAt: number;
}

export interface AssetTvl {
  createdAt: number;
  tvlNative: number;
  tvlUnderlying: number;
}

export interface AssetTotalApy {
  createdAt: number;
  totalSupplyApy: number;
  supplyApy: number;
  ankrBNBApr?: number;
  compoundingApy?: number;
  rewardApy?: number;
  borrowApy?: number;
}

export interface ChartData {
  createdAt: number;
  [key: string]: number;
}
