import { Contract } from "ethers";

import { InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../../types";

export async function verifyFluxOraclePriceFeed({
  midasSdk,
  underlyingOracle,
  asset,
}: VerifyFeedParams): Promise<PriceFeedValidity> {
  const feed = await underlyingOracle.callStatic.priceFeeds(asset.underlying);
  const fluxFeed = new Contract(
    feed,
    [
      "function latestRoundData() external view returns returns (uint80, int256, uint256, uint256, uint80)",
      "function getRoundData(uint80) external view returns (uint80,int256,uint256,uint256,uint80)",
    ],
    midasSdk.provider
  );
  const [roundId, value, , updatedAt] = await fluxFeed.callStatic.latestRoundData();
  const [, previousValue] = await fluxFeed.callStatic.getRoundData(roundId.sub(1));

  const deviation = Math.abs((value.toNumber() - previousValue.toNumber()) / previousValue.toNumber()) * 100;
  const updatedAtts = updatedAt.toNumber();
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - updatedAtts;

  if (timeSinceLastUpdate > asset.maxObservationDelay && deviation > asset.deviationThreshold) {
    return {
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${asset.maxObservationDelay}`,
    };
  }
  return true;
}
