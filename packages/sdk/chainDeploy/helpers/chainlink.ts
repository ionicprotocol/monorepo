import { providers } from "ethers";
import { ChainlinkPriceOracleV2 } from "../../lib/contracts/typechain/ChainlinkPriceOracleV2";
import { Asset, ChainlinkDeployFnParams, ChainlinkFeedBaseCurrency } from "./types";

export const deployChainlinkOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets,
  chainlinkAssets,
}: ChainlinkDeployFnParams): Promise<{ cpo: any; chainLinkv2: any }> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;

  //// Chainlink Oracle
  const cpo = await deployments.deploy("ChainlinkPriceOracleV2", {
    from: deployer,
    args: [deployer, true, deployConfig.wtoken, deployConfig.nativeTokenUsdChainlinkFeed],
    log: true,
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("ChainlinkPriceOracleV2: ", cpo.address);

  const chainLinkv2 = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
  tx = await chainLinkv2.setPriceFeeds(
    chainlinkAssets.map((c) => assets.find((a: Asset) => a.symbol === c.symbol).underlying),
    chainlinkAssets.map((c) => c.aggregator),
    ChainlinkFeedBaseCurrency.USD
  );
  console.log(`Set price feeds for ChainlinkPriceOracleV2: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for ChainlinkPriceOracleV2 mined: ${tx.hash}`);

  const underlyings = chainlinkAssets.map((c) => assets.find((a) => a.symbol === c.symbol).underlying);
  const oracles = Array(chainlinkAssets.length).fill(chainLinkv2.address);

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  return { cpo: cpo, chainLinkv2: chainLinkv2 };
};
