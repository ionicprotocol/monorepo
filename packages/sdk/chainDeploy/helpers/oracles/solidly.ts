import { constants, providers } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { SolidlyPriceOracle } from "../../../typechain/SolidlyPriceOracle";
import { SolidlyDeployFnParams, SolidlyOracleAssetConfig, SolidlyOracleDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deploySolidlyLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  solidlyLps
}: SolidlyDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOracle = await deployments.deploy("SolidlyLpTokenPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
    waitConfirmations: 1
  });
  console.log("SolidlyLpTokenPriceOracle: ", lpTokenPriceOracle.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const underlyings = solidlyLps.map((d) => d.lpTokenAddress);

  await addUnderlyingsToMpo(mpo, underlyings, lpTokenPriceOracle.address);
};

export const deploySolidlyPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  supportedBaseTokens,
  assets
}: SolidlyOracleDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const solidlyPriceOracle = await deployments.deploy("SolidlyPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken, supportedBaseTokens]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (solidlyPriceOracle.transactionHash) await ethers.provider.waitForTransaction(solidlyPriceOracle.transactionHash);
  console.log("SolidlyPriceOracle: ", solidlyPriceOracle.address);

  const solidlyOracle = (await ethers.getContract("SolidlyPriceOracle", deployer)) as SolidlyPriceOracle;

  const currentSupportedBaseTokens = await solidlyOracle.callStatic.getSupportedBaseTokens();
  let missingBaseTokens = false;
  for (const baseToken of supportedBaseTokens) {
    if (!currentSupportedBaseTokens.includes(baseToken)) {
      console.log(`Base token ${baseToken} not currently supported`);
      missingBaseTokens = true;
    }
  }
  if (missingBaseTokens) {
    console.log(`${supportedBaseTokens.length} base tokens to be set: ${supportedBaseTokens.join(", ")}`);
    const tx: providers.TransactionResponse = await solidlyOracle._setSupportedBaseTokens(supportedBaseTokens);
    const receipt = await tx.wait();
    console.log("supported base tokens mined: ", receipt.transactionHash);
  }

  const assetsToAdd: SolidlyOracleAssetConfig[] = [];

  for (const asset of assets) {
    const registered = await solidlyOracle.poolFeeds(asset.underlying);

    if (registered.poolAddress !== constants.AddressZero) {
      console.log("Underlying already registered", asset.underlying);
      continue;
    }
    assetsToAdd.push(asset);
  }

  const underlyings = assetsToAdd.map((c) => c.underlying);
  const assetConfigs = assetsToAdd.map((c) => {
    return { baseToken: c.baseToken, poolAddress: c.poolAddress };
  });

  if (underlyings.length !== 0) {
    console.log(`${underlyings.length} assets to add`);
    const tx: providers.TransactionResponse = await solidlyOracle.setPoolFeeds(underlyings, assetConfigs);
    console.log("registerPool sent: ", tx.hash);
    const receipt: providers.TransactionReceipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);

    const mpo = await ethers.getContract("MasterPriceOracle", deployer);
    await addUnderlyingsToMpo(mpo, underlyings, solidlyOracle.address);
  } else {
    console.log("No assets to add");
  }
};
