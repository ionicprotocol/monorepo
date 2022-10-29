import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { InvalidReason, logger, SupportedAssetPriceValidity } from "../../";
import { config } from "../../config";

export async function verifyUniswapV2PriceFeed(
  midasSdk: MidasSdk,
  oracleAddress: string,
  underlying: string
): Promise<SupportedAssetPriceValidity> {
  logger.debug(`Verifying Uniswap Twap oracle for ${underlying}`);
  const twapOracle = new Contract(
    oracleAddress,
    midasSdk.oracles[OracleTypes.UniswapTwapPriceOracleV2].abi,
    midasSdk.provider
  );
  const baseToken = await twapOracle.callStatic.baseToken();
  const uniswapV2Factory = new Contract(
    midasSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    midasSdk.provider
  );
  const pair = await uniswapV2Factory.callStatic.getPair(underlying, baseToken);

  const rootOracleAddress = await twapOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    midasSdk.artifacts.UniswapTwapPriceOracleV2Root.abi,
    midasSdk.provider
  );
  const workable = await rootTwapOracle.callStatic.workable(
    [pair],
    [baseToken],
    [config.defaultMinPeriod],
    [config.defaultDeviationThreshold]
  );
  if (workable[0]) {
    logger.warn(`Pair is in workable = ${workable[0]} state, this is likely not a good sign`);
    return {
      valid: false,
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      extraInfo: {
        message: `TWAP oracle is in workable = true state, meaning bot is not updating the values`,
        extraData: {
          workablePair: workable[0],
        },
      },
    };
  }
  return {
    valid: true,
    invalidReason: null,
    extraInfo: null,
  };
}
