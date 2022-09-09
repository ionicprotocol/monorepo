import { ChainlinkFeedResponseHeartbeat, ChainlinkFeedResponseStatus } from "./enums";

enum ChainLinkFeedStatusEnum {}
enum ChainLinkFeedHeartbeatEnum {}
export type ChainLinkFeedStatus = ChainLinkFeedStatusEnum | ChainlinkFeedResponseStatus;
export type ChainLinkFeedHeartbeat = ChainLinkFeedHeartbeatEnum | ChainlinkFeedResponseHeartbeat;

export type ChainLinkAssetConfig = {
  symbolMappings: Array<Record<string, string>>;
  chainLinkApiResponseKey: { networkName: string; networkIndex: number };
  defaultValidatorNumber: number;
};

export type ChainLinkFeed = {
  deviationThreshold: number;
  feedStatus: ChainLinkFeedStatus;
  validators: number;
  heartbeat: number;
};

export type ChainLinkFeedResponse = {
  pair: string;
  assetName: string;
  deviationThreshold: number;
  heartbeat: ChainlinkFeedResponseHeartbeat;
  decimals: string;
  proxy: string;
  feedCategory: ChainlinkFeedResponseStatus;
  feedType: string;
};
