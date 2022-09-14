export type ChainLinkFeedStatus = "verified" | "monitored" | "custom" | "deprecating";
export type ChainLinkFeedHeartbeat = "1m" | "10m" | "15m" | "24h";

export type ChainLinkAssetConfig = {
  symbolMappings: Record<string, string>;
  chainLinkApiResponseKey: { networkName: string; networkIndex: number };
  defaultValidatorNumber: number;
};

export type ChainLinkFeed = {
  deviationThreshold: number;
  feedStatus: ChainLinkFeedStatus;
  validators: number;
  heartbeat: number;
  symbol: string;
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

export type ScoreRange = {
  range: [number, number] | number;
  score: number;
};

export type ScoreEnum = {
  enum: ChainLinkFeedStatus;
  score: number;
};
