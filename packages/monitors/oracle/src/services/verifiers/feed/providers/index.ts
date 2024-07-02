import { OracleTypes } from "@ionicprotocol/types";

import { FeedVerifierConfig, PriceFeedInvalidity, VerifyFeedParams } from "../../../../types";

import { verifyChainLinkOraclePriceFeed } from "./chainlink";
export { verifyPriceValue } from "./price";

export async function verifyProviderFeed(
  oracle: OracleTypes,
  _: FeedVerifierConfig,
  args: VerifyFeedParams,
): Promise<PriceFeedInvalidity | true> {
  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      return await verifyChainLinkOraclePriceFeed(args);
    default:
      return true;
  }
}
