import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { PriceFeedInvalidity } from "../..";

import { verifyChainLinkOraclePriceFeed } from "./chainlink";
import { verifyDiaOraclePriceFeed } from "./dia";
import { verifyFluxOraclePriceFeed } from "./flux";
import { verifyUniswapV2PriceFeed } from "./uniswapV2";
export { verifyPriceValue } from "./price";
export { getMpoPrice } from "./mpo";

export interface VerifyFeedParams {
  midasSdk: MidasSdk;
  underlyingOracle: Contract;
  underlying: string;
}

export async function verifyProviderFeed(
  oracle: OracleTypes,
  args: VerifyFeedParams
): Promise<PriceFeedInvalidity | null> {
  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      return await verifyChainLinkOraclePriceFeed(args);
    case OracleTypes.DiaPriceOracle:
      return await verifyDiaOraclePriceFeed(args);
    case OracleTypes.FluxPriceOracle:
      return await verifyFluxOraclePriceFeed(args);
    case OracleTypes.UniswapTwapPriceOracleV2:
      return await verifyUniswapV2PriceFeed(args);
    default:
      return null;
  }
}
