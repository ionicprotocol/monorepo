import { heartbeatToSeconds } from "../../enums";
import { ChainLinkAssetConfig, ChainLinkFeed, ChainLinkFeedResponse } from "../scorers/chainlink/types";

import { http } from ".";

const CHAINLINK_FEED_API = "https://cl-docs-addresses.web.app/addresses.json";

type NetworkResponse = {
  proxies: ChainLinkFeedResponse[];
  name: string;
  networkType: string;
};

interface ChainLinkResponse {
  [key: string]: {
    networks: Array<NetworkResponse>;
  };
}

export async function fetchChainLinkFeedParameters(assetConfig: ChainLinkAssetConfig): Promise<ChainLinkFeed[]> {
  const response = await http<ChainLinkResponse>(CHAINLINK_FEED_API);
  const { networkName, networkIndex } = assetConfig.chainLinkApiResponseKey;
  const { proxies, networkType } = response.data[networkName].networks[networkIndex];
  if (networkType !== "mainnet") {
    throw new Error(`Chainlink feed API returned ${networkType} network type`);
  }
  return proxies
    .filter((proxy) => {
      if (proxy.pair in assetConfig.symbolMappings) {
        return proxy;
      }
    })
    .map((proxy) => {
      return {
        validators: assetConfig.defaultValidatorNumber,
        heartbeat: heartbeatToSeconds[proxy.heartbeat],
        deviationThreshold: proxy.deviationThreshold,
        feedStatus: proxy.feedCategory,
        symbols: assetConfig.symbolMappings[proxy.pair],
      };
    });
}
