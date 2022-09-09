import { heartbeatToSeconds } from "../../enums";
import { ChainLinkAssetConfig, ChainLinkFeed, ChainLinkFeedResponse } from "../../types";

import { http, HttpResponse } from ".";

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

export async function fetchChainLinkFeedParameters(
  assetConfig: ChainLinkAssetConfig
): Promise<HttpResponse<ChainLinkResponse>> {
  const response = await http<ChainLinkResponse>(CHAINLINK_FEED_API);
  return response;
  // const { networkName, networkIndex } = assetConfig.chainLinkApiResponseKey;
  // const { proxies, networkType } = response.parsedBody[networkName].networks[networkIndex];
  // if (networkType !== "mainnet") {
  //   throw new Error(`Chainlink feed API returned ${networkType} network type`);
  // }
  // return proxies.map((c) => {
  //   return {
  //     validators: assetConfig.defaultValidatorNumber,
  //     heartbeat: heartbeatToSeconds[c.heartbeat],
  //     deviationThreshold: c.deviationThreshold,
  //     feedStatus: c.feedCategory,
  //   };
  // });
}
