import { Provider } from "@ethersproject/providers";
import { Fuse, OracleConfig, OracleTypes } from "@midas-capital/sdk";
import { Contract } from "ethers";

import { logger } from "./index";

export default async function verifyOracleProviderPriceFeed(fuse: Fuse, oracle: OracleTypes, underlying: string) {
  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      await verifyChainLinkOraclePriceFeed(fuse.provider, fuse.oracles, underlying);
      break;
    case OracleTypes.DiaPriceOracle:
      await verifyDiaOraclePriceFeed(fuse.oracles, underlying);
      break;
    case OracleTypes.FluxPriceOracle:
      await verifyFluxOraclePriceFeed(fuse.oracles, underlying);
      break;
    case OracleTypes.AnkrBNBcPriceOracle:
      await verifyAnkrOraclePriceFeed(fuse.oracles, underlying);
      break;
    default:
      logger.info("pass");
  }
}

async function verifyChainLinkOraclePriceFeed(provider: Provider, oracleConfig: OracleConfig, underlying: string) {
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
  const [roundId, answer, startedAt, updatedAt, answeredInRound] = await chainLinkFeed.callStatic.latestRoundData();
  const updatedAtts = updatedAt.toNumber();
  console.log(Math.floor(Date.now() / 1000) - updatedAtts);
  logger.info({ roundId, answer, startedAt, updatedAt, answeredInRound });
  return Math.floor(Date.now() / 1000) - updatedAtts < (parseInt(process.env.MAX_OBSERVATION_DELAY!) || 1800);
}

async function verifyDiaOraclePriceFeed(oracleConfig: OracleConfig, underlying: string) {
  console.log(oracleConfig, underlying);
}

async function verifyFluxOraclePriceFeed(oracleConfig: OracleConfig, underlying: string) {
  console.log(oracleConfig, underlying);
}

async function verifyAnkrOraclePriceFeed(oracleConfig: OracleConfig, underlying: string) {
  console.log(oracleConfig, underlying);
}
