import { SecurityBaseConstructor } from "../../..";
import { chainLinkOracleAssetMappings } from "../../constants";
import { fetchChainLinkFeedParameters } from "../../fetchers";
import { scoreEnum, scoreRanges } from "../generic";

import { feedStatusEnums, heartbeatRanges, validatorsRanges } from "./constants";
import { ChainLinkFeed } from "./types";

export function withChainLinkOracleScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class ChainLinkOracle extends Base {
    async getChainLinkOracleRating(): Promise<Array<ChainLinkFeed>> {
      const { chainId } = this.chainConfig;
      const chainLinkFeedParameters = await fetchChainLinkFeedParameters(chainLinkOracleAssetMappings[chainId]);
      const scoredChainLinkFeed = chainLinkFeedParameters.map((feed) => {
        feed.score = this.#scoreChainLinkFeed(feed);
        return feed;
      });
      return scoredChainLinkFeed;
    }
    #scoreChainLinkFeed(feed: ChainLinkFeed): number {
      const heartbeatScore = scoreRanges(feed.heartbeat, heartbeatRanges);
      const validatorScore = scoreRanges(feed.validators, validatorsRanges);
      const feedStatusScore = scoreEnum(feed.feedStatus, feedStatusEnums);
      return heartbeatScore * validatorScore * feedStatusScore;
    }
  };
}
