import { BigNumber } from "ethers";

export interface FuseAsset {
  cToken: string;
  plugin?: string;

  /** scaled by `underlying.decimals()`  */
  borrowBalance: BigNumber;
  /** scaled by `underlying.decimals()`  */
  supplyBalance: BigNumber;

  /** scaled by `underlying.decimals()`  */
  liquidity: BigNumber;
  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: string;
  underlyingDecimals: BigNumber;

  /** scaled by `1e18` */
  underlyingPrice: BigNumber;

  /** scaled by `underlying.decimals()`  */
  underlyingBalance: BigNumber;

  /** scaled by `1e18` */
  collateralFactor: BigNumber;
  /** scaled by `1e18` */
  reserveFactor: BigNumber;

  adminFee: BigNumber;
  fuseFee: BigNumber;

  borrowRatePerBlock: BigNumber;
  supplyRatePerBlock: BigNumber;

  /** scaled by `underlying.decimals()`  */
  totalBorrow: BigNumber;
  /** scaled by `underlying.decimals()`  */
  totalSupply: BigNumber;

  isBorrowPaused: boolean;
  isSupplyPaused: boolean;
}

export interface NativePricedFuseAsset extends FuseAsset {
  supplyBalanceNative: number;
  borrowBalanceNative: number;

  totalSupplyNative: number;
  totalBorrowNative: number;

  liquidityNative: number;
  utilization: number;

  extraDocs?: string;

  borrowGuardianPaused: boolean;
  mintGuardianPaused: boolean;

  logoUrl?: string;
  originalSymbol?: string;

  netSupplyBalance: BigNumber;
  netSupplyBalanceNative: number;
}

export interface FusePoolData {
  id: number;
  chainId: number;
  assets: NativePricedFuseAsset[];
  creator: string;
  comptroller: string;
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
  blockPosted: BigNumber;
  timestampPosted: BigNumber;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  utilization: number;
}

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
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
