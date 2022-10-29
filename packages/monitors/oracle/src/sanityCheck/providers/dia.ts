import { Provider } from "@ethersproject/providers";
import { OracleConfig, OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { InvalidReason, SupportedAssetPriceValidity } from "../../";
import { config } from "../../config";

export async function verifyDiaOraclePriceFeed(
  provider: Provider,
  oracleConfig: OracleConfig,
  underlying: string
): Promise<SupportedAssetPriceValidity> {
  const diaPriceOracle = new Contract(
    oracleConfig[OracleTypes.DiaPriceOracle].address,
    oracleConfig[OracleTypes.DiaPriceOracle].abi,
    provider
  );
  const feedAddress = await diaPriceOracle.callStatic.priceFeeds(underlying);
  const diaFeed = new Contract(
    feedAddress,
    ["function getValue(string memory key) external view returns (uint128, uint128)"],
    provider
  );
  const [, timestamp] = await diaFeed.callStatic.latestRoundData();
  const updatedAtts = timestamp.toNumber();
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
