import { BigNumber } from "ethers";

import { LiquidationStrategy, OracleTypes, RedemptionStrategy, SupportedChains } from "./enums";

export interface FuseAsset {
  cToken: string;
  plugin?: string;

  borrowBalance: BigNumber;
  supplyBalance: BigNumber;
  liquidity: BigNumber;

  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: string;
  underlyingDecimals: BigNumber;
  underlyingPrice: BigNumber;
  underlyingBalance: BigNumber;

  collateralFactor: BigNumber;
  reserveFactor: BigNumber;

  adminFee: BigNumber;
  fuseFee: BigNumber;

  borrowRatePerBlock: BigNumber;
  supplyRatePerBlock: BigNumber;

  totalBorrow: BigNumber;
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
}

export interface FusePoolData {
  id: number;
  assets: NativePricedFuseAsset[];
  creator: string;
  comptroller: string;
  name: string;
  totalLiquidityNative: number;
  totalAvailableLiquidityNative: number;
  totalSuppliedNative: number;
  totalBorrowedNative: number;
  totalSupplyBalanceNative: number;
  totalBorrowBalanceNative: number;
  blockPosted: BigNumber;
  timestampPosted: BigNumber;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  whitelistedAdmin: boolean;
  utilization: number;
}

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  blockPosted: number;
  timestampPosted: number;
}

export type SupportedAsset = {
  symbol: string;
  underlying: string;
  name: string;
  decimals: number;
  disabled?: boolean;
  oracle?: OracleTypes;
  simplePriceOracleAssetPrice?: BigNumber;
};

interface PluginData {
  market: string;
  name: string;
  strategy?: string;
}

export type DeployedPlugins = {
  [pluginAddress: string]: PluginData;
};

export type ChainDeployedPlugins = {
  [chain in SupportedChains]: DeployedPlugins;
};

export type ChainLiquidationDefaults = {
  [chain in SupportedChains]: {
    SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
    SUPPORTED_INPUT_CURRENCIES: Array<string>;
    LIQUIDATION_STRATEGY: LiquidationStrategy;
    MINIMUM_PROFIT_NATIVE: BigNumber;
    LIQUIDATION_INTERVAL_SECONDS: number;
  };
};

export type ChainRedemptionStrategy = {
  [chain in SupportedChains]: {
    [token: string]: RedemptionStrategy;
  };
};

export type ChainOracles = {
  [chain in SupportedChains]: string[];
};

export type ChainIrms = {
  [chain in SupportedChains]: string[];
};

export type ChainSpecificParams = {
  [chain in SupportedChains]: ChainParams;
};

export type ChainParams = {
  blocksPerYear: BigNumber;
  cgId: string;
};

export type ChainAddresses = {
  W_TOKEN: string;
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
  UNISWAP_V2_ROUTER: string;
  UNISWAP_V2_FACTORY: string;
  PAIR_INIT_HASH: string;
};

export type ChainSpecificAddresses = {
  [chain in SupportedChains]: ChainAddresses;
};

export type ChainSupportedAssets = {
  [chain in SupportedChains]: SupportedAsset[];
};
