import { BigNumber, Contract, utils } from "ethers";

import { logger } from "../../../../logger";
import { FeedVerifierConfig, InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../../types";

export async function verifyUniswapV2PriceFeed(
  { midasSdk, underlyingOracle, asset }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  logger.debug(`Verifying Uniswap Twap oracle for ${asset.underlying}`);

  const baseToken = await underlyingOracle.callStatic.baseToken();
  const uniswapV2Factory = new Contract(
    midasSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    midasSdk.provider
  );
  const pair = await uniswapV2Factory.callStatic.getPair(asset.underlying, baseToken);

  const rootOracleAddress = await underlyingOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    midasSdk.chainDeployment.UniswapTwapPriceOracleV2Root.abi,
    midasSdk.provider
  );

  const workable = await rootTwapOracle.callStatic.workable(
    [pair],
    [baseToken],
    [BigNumber.from(config.defaultMaxObservationDelay)],
    [utils.parseEther(asset.deviationThreshold.toString())]
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
