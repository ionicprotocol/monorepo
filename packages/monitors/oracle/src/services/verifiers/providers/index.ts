import { OracleTypes } from "@midas-capital/types";

import { FeedVerifierConfig, PriceFeedInvalidity, VerifyFeedParams } from "../../../types";

import { verifyChainLinkOraclePriceFeed } from "./chainlink";
import { verifyDiaOraclePriceFeed } from "./dia";
import { verifyFluxOraclePriceFeed } from "./flux";
import { verifyUniswapV2PriceFeed } from "./uniswapV2";
export { verifyPriceValue } from "./price";

export async function verifyProviderFeed(
  oracle: OracleTypes,
  config: FeedVerifierConfig,
  args: VerifyFeedParams
): Promise<PriceFeedInvalidity | true> {
  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      return await verifyChainLinkOraclePriceFeed(args, config);
    case OracleTypes.DiaPriceOracle:
      return await verifyDiaOraclePriceFeed(args, config);
    case OracleTypes.FluxPriceOracle:
      return await verifyFluxOraclePriceFeed(args, config);
    case OracleTypes.UniswapTwapPriceOracleV2:
      return await verifyUniswapV2PriceFeed(args, config);
    default:
      return true;
  }
}
