import { FeedVerifierConfig, PriceFeedValidity, VerifyFeedParams } from "../../../../types";

export async function verifyFluxOraclePriceFeed(
  { midasSdk, underlyingOracle, underlying }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  const { availableOracles } = midasSdk;
  console.log(availableOracles, underlying, underlyingOracle, config);
  return true;
}
