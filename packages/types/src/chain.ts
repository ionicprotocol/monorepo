import { BigNumber } from "ethers";

import { ChainlinkFeedBaseCurrency, IrmTypes, OracleTypes, SupportedChains } from "./enums";
import { LeveragePoolConfig } from "./leverage";
import { FundingStrategy, LiquidationDefaults, RedemptionStrategy } from "./liquidation";
import { DeployedPlugins } from "./plugin";

export type ChainlinkSpecificParams = {
  aggregator: string;
  feedBaseCurrency: ChainlinkFeedBaseCurrency;
};

export type PythSpecificParams = { feed: string };

export type SupportedAsset = {
  symbol: string;
  underlying: string;
  name: string;
  decimals: number;
  extraDocs?: string;
  disabled?: boolean;
  oracle?: OracleTypes;
  simplePriceOracleAssetPrice?: BigNumber;
  originalSymbol?: string;
  oracleSpecificParams?: ChainlinkSpecificParams | PythSpecificParams;
};
export type BlockExplorer = {
  name: string;
  url: string;
};

export type RpcUrls = {
  http: string[];
  webSocket?: string[];
};

export interface ChainMetadata {
  chainIdHex: string;
  shortName: string;
  name: string;
  img: string;
  uniswapV3Routers?: {
    [key: string]: {
      [key: string]: string | null;
    };
  };
  uniswapV3Fees?: {
    [key: string]: {
      [key: string]: number;
    };
  };
  rpcUrls: { [key: string]: RpcUrls; default: RpcUrls; public: RpcUrls };
  blockExplorerUrls: {
    [key: string]: BlockExplorer;
    default: BlockExplorer;
  };
  nativeCurrency: {
    symbol: string;
    name: string;
  };
  wrappedNativeCurrency: {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    color: string;
    overlayTextColor: string;
    logoURL: string;
  };
  testnet?: boolean | undefined;
}

export type ChainParams = {
  blocksPerYear: BigNumber;
  cgId: string;
  metadata: ChainMetadata;
};

export type ChainAddresses = {
  W_TOKEN: string;
  STABLE_TOKEN: string;
  W_BTC_TOKEN: string;
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
  UNISWAP_V2_ROUTER: string;
  UNISWAP_V2_FACTORY: string;
  UNISWAP_V3_ROUTER?: string;
  PAIR_INIT_HASH: string;
  UNISWAP_V3?: {
    FACTORY: string;
    PAIR_INIT_HASH: string;
    QUOTER_V2: string;
  };
  ALGEBRA_SWAP_ROUTER?: string;
  SOLIDLY_SWAP_ROUTER?: string;
  GAMMA_ALGEBRA_SWAP_ROUTER?: string;
  GAMMA_ALGEBRA_UNI_PROXY?: string;
  GAMMA_UNISWAP_V3_SWAP_ROUTER?: string;
  GAMMA_UNISWAP_V3_UNI_PROXY?: string;
};

export type ChainSupportedAssets = {
  [chain in SupportedChains]: SupportedAsset[];
};

export type ChainConfig = {
  chainId: number;
  chainAddresses: ChainAddresses;
  assets: SupportedAsset[];
  irms: IrmTypes[];
  liquidationDefaults: LiquidationDefaults;
  oracles: OracleTypes[];
  specificParams: ChainParams;
  deployedPlugins: DeployedPlugins;
  redemptionStrategies: RedemptionStrategy[];
  fundingStrategies: FundingStrategy[];
  chainDeployments: ChainDeployment;
  leveragePairs: LeveragePoolConfig[];
};

export type ChainDeployment = {
  [contractName: string]: {
    abi?: any;
    address: string;
  };
};
