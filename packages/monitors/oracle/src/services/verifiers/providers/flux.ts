import { FeedVerifierConfig, PriceFeedValidity, VerifyFeedParams } from "../../../types";

export async function verifyFluxOraclePriceFeed(
  { midasSdk, underlyingOracle, underlying }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  const { oracles } = midasSdk;
  console.log(oracles, underlying, underlyingOracle, config);
  return true;
}
