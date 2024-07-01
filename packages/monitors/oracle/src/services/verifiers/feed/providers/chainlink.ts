import { Address, getContract, parseAbi } from "viem";

import { logger } from "../../../../logger";
import { InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../../types";

export async function verifyChainLinkOraclePriceFeed({
  ionicSdk,
  underlyingOracle,
  asset,
}: VerifyFeedParams): Promise<PriceFeedValidity> {
  logger.debug(`Verifying ChainLink oracle for ${asset.underlying}`);

  const feedAddress = (await underlyingOracle.read.priceFeeds([asset.underlying])) as Address;
  const chainLinkFeed = getContract({
    address: feedAddress,
    abi: parseAbi([
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function getRoundData(uint80 roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    ]),
    client: ionicSdk.publicClient,
  });
  const [roundId, value, , updatedAt] = await chainLinkFeed.read.latestRoundData();
  const [, previousValue, ,] = await chainLinkFeed.read.getRoundData([roundId - 1n]);

  const deviation = Math.abs((Number(value) - Number(previousValue)) / Number(previousValue)) * 100;
  const updatedAtts = updatedAt;
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - Number(updatedAtts);

  if (timeSinceLastUpdate > asset.maxObservationDelay && deviation > asset.deviationThreshold) {
    return {
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${asset.maxObservationDelay}`,
    };
  }
  return true;
}
