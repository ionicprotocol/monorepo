export enum ChainlinkFeedBaseCurrency {
  ETH,
  USD,
}

export type ChainDeployConfig = {
  wtoken: string;
  nativeTokenUsdChainlinkFeed?: string;
  nativeTokenName: string;
  nativeTokenSymbol: string;
  uniswapV2RouterAddress: string;
  uniswapV2FactoryAddress: string;
  stableToken?: string;
  wBTCToken?: string;
  pairInitHashCode?: string;
  blocksPerYear: number;
  hardcoded: { name: string; symbol: string; address: string }[];
  uniswapData: { lpName: string; lpSymbol: string; lpDisplayName: string }[];
};
