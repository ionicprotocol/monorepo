import { SALT } from "../../deploy/deploy";
import { ChainlinkFeedBaseCurrency } from "./types";

export const deployChainlinkOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets,
  chainlinkMappingUsd,
}: any): Promise<{ cpo: any; chainLinkv2: any }> => {
  const { deployer } = await getNamedAccounts();
  //// Chainlink Oracle
  let dep = await deployments.deterministic("ChainlinkPriceOracleV2", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [deployer, true, deployConfig.wtoken, deployConfig.nativeTokenUsdChainlinkFeed],
    log: true,
  });
  const cpo = await dep.deploy();
  console.log("ChainlinkPriceOracleV2: ", cpo.address);

  const chainLinkv2 = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
  await chainLinkv2.setPriceFeeds(
    chainlinkMappingUsd.map((c: { symbol: any; }) => assets.find((a: { symbol: any; }) => a.symbol === c.symbol).underlying),
    chainlinkMappingUsd.map((c: { aggregator: any; }) => c.aggregator),
    ChainlinkFeedBaseCurrency.USD
  );
  return { cpo: cpo, chainLinkv2: chainLinkv2 };
};
