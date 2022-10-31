import { Contract } from "ethers";

import { config as serviceConfig } from "../../../config";
import { logger } from "../../../index";
import { FeedVerifierConfig, InvalidReason, PriceFeedInvalidity, VerifyFeedParams } from "../../../types";

export async function verifyDiaOraclePriceFeed({
  midasSdk,
  underlyingOracle,
  underlying,
}: VerifyFeedParams): Promise<PriceFeedInvalidity | null> {
  logger.debug(`Verifying Dia oracle for ${underlying}`);
  const feedAddress = await underlyingOracle.callStatic.priceFeeds(underlying);
  const diaFeed = new Contract(
    feedAddress,
    ["function getValue(string memory key) external view returns (uint128, uint128)"],
    midasSdk.provider
  );
  const [, timestamp] = await diaFeed.callStatic.latestRoundData();
  const updatedAtts = timestamp.toNumber();
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - updatedAtts;

  const config = serviceConfig as FeedVerifierConfig;

  const isValid = timeSinceLastUpdate < config.maxObservationDelay;
  if (!isValid) {
    return {
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${config.maxObservationDelay}`,
    };
  }
  return null;
}
