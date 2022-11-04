import { Contract } from "ethers";

import { logger } from "../../../index";
import { FeedVerifierConfig, InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../types";

export async function verifyChainLinkOraclePriceFeed(
  { midasSdk, underlyingOracle, underlying }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  logger.debug(`Verifying ChainLink oracle for ${underlying}`);

  const feedAddress = await underlyingOracle.callStatic.priceFeeds(underlying);
  const chainLinkFeed = new Contract(
    feedAddress,
    [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    ],
    midasSdk.provider
  );
  const [, , , updatedAt] = await chainLinkFeed.callStatic.latestRoundData();
  const updatedAtts = updatedAt.toNumber();
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - updatedAtts;

  const isValid = timeSinceLastUpdate < config.maxObservationDelay;
  if (!isValid) {
    return {
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${config.maxObservationDelay}`,
    };
  }
  return true;
}
