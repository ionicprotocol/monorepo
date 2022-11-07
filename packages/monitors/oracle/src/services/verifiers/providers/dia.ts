import { Contract } from "ethers";

import { logger } from "../../../index";
import { FeedVerifierConfig, InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../types";

export async function verifyDiaOraclePriceFeed(
  { midasSdk, underlyingOracle, underlying }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  logger.debug(`Verifying Dia oracle for ${underlying}`);
  const { feed, key } = await underlyingOracle.callStatic.priceFeeds(underlying);
  const diaFeed = new Contract(
    feed,
    ["function getValue(string memory key) external view returns (uint128, uint128)"],
    midasSdk.provider
  );
  const [, timestamp] = await diaFeed.callStatic.getValue(key);
  const updatedAtts = timestamp.toNumber();
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
