import { SecurityBaseConstructor } from "..";
import { ChainLinkFeed } from "../types";

import { chainLinkOracleAssetMappings } from "./constants";
import { fetchChainLinkFeedParameters } from "./fetchers";
import { scoreChainLinkFeed } from "./scorers/chainlink";

export function withOracle<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class PoolAsset extends Base {
    async getOracleRating(): Promise<Array<ChainLinkFeed>> {
      const { chainId } = this.chainConfig;
      const chainLinkFeedParameters = await fetchChainLinkFeedParameters(chainLinkOracleAssetMappings[chainId]);
      const scoredChainLinkFeed = chainLinkFeedParameters.map((feed) => {
        feed.score = scoreChainLinkFeed(feed);
        return feed;
      });
      return scoredChainLinkFeed;
    }
    async getOraclePrice(): Promise<null> {
      return null;
    }
  };
}
