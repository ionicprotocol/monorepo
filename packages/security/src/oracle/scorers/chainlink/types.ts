export type ChainLinkFeedStatus = "verified" | "monitored" | "custom" | "deprecating";
export type ChainLinkFeedHeartbeat = "27s" | "30s" | "1m" | "5m" | "10m" | "15m" | "20m" | "6h" | "24h";

export type ChainLinkAssetConfig = {
  symbolMappings: Record<string, string | Array<string>>;
  chainLinkApiResponseKey: { networkName: string; networkIndex: number };
  defaultValidatorNumber: number;
};

export type ChainLinkFeed = {
  deviationThreshold: number;
  feedStatus: ChainLinkFeedStatus;
  validators: number;
  heartbeat: number;
  symbols: string | Array<string>;
  score?: number;
};

export type ChainLinkFeedResponse = {
  pair: string;
  assetName: string;
  deviationThreshold: number;
  heartbeat: ChainLinkFeedHeartbeat;
  decimals: string;
  proxy: string;
  feedCategory: ChainLinkFeedStatus;
  feedType: string;
};
