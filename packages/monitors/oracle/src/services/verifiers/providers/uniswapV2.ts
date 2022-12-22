import UniswapTwapPriceOracleV2RootABI from "./UniswapTwapPriceOracleV2RootABI";
import { Contract } from "ethers";

import { logger } from "../../..";
import { FeedVerifierConfig, InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../types";

export async function verifyUniswapV2PriceFeed(
  { midasSdk, underlyingOracle, underlying }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  logger.debug(`Verifying Uniswap Twap oracle for ${underlying}`);

  const baseToken = await underlyingOracle.callStatic.baseToken();
  const uniswapV2Factory = new Contract(
    midasSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    midasSdk.provider
  );
  const pair = await uniswapV2Factory.callStatic.getPair(underlying, baseToken);

  const rootOracleAddress = await underlyingOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(rootOracleAddress, UniswapTwapPriceOracleV2RootABI, midasSdk.provider);

  const workable = await rootTwapOracle.callStatic.workable(
    [pair],
    [baseToken],
    [config.defaultMinPeriod],
    [config.defaultDeviationThreshold]
  );
  if (workable[0]) {
    logger.warn(`Pair is in workable = ${workable[0]} state, this is likely not a good sign`);
    return {
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      message: `TWAP oracle is in workable = true state, meaning bot is not updating the values. (Workable pair: ${workable[0]})`,
    };
  }
  return true;
}
