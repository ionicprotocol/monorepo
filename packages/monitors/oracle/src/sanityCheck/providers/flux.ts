import { PriceFeedInvalidity } from "../../";

import { VerifyFeedParams } from ".";

export async function verifyFluxOraclePriceFeed({
  midasSdk,
  underlyingOracle,
  underlying,
}: VerifyFeedParams): Promise<PriceFeedInvalidity | null> {
  const { oracles } = midasSdk;
  console.log(oracles, underlying, underlyingOracle);
  return null;
}
