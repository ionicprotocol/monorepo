import { Provider } from "@ethersproject/providers";
import { OracleConfig, OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { config } from "../../config";
import { InvalidReason, logger, SupportedAssetPriceValidity } from "../../index";

export async function verifyChainLinkOraclePriceFeed(
  provider: Provider,
  oracleConfig: OracleConfig,
  underlying: string
): Promise<SupportedAssetPriceValidity> {
  logger.debug(`Verifying ChainLink oracle for ${underlying}`);
  const chainLinkOracle = new Contract(
    oracleConfig[OracleTypes.ChainlinkPriceOracleV2].address,
    oracleConfig[OracleTypes.ChainlinkPriceOracleV2].abi,
    provider
  );
  const feedAddress = await chainLinkOracle.callStatic.priceFeeds(underlying);
  const chainLinkFeed = new Contract(
    feedAddress,
    [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
    ],
    provider
  );
  const [, , , updatedAt] = await chainLinkFeed.callStatic.latestRoundData();
  const updatedAtts = updatedAt.toNumber();
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - updatedAtts;
  const isValid = timeSinceLastUpdate < config.maxObservationDelay;
  return {
    valid: isValid,
    invalidReason: isValid ? null : InvalidReason.LAST_OBSERVATION_TOO_OLD,
    extraInfo: isValid
      ? null
      : {
          message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${config.maxObservationDelay}`,
          extraData: {
            timeSinceLastUpdate,
          },
        },
  };
}
