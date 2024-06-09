import { constants } from "ethers";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";

import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());
  const { deployer, multisig } = await getNamedAccounts();

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  ////
  //// ORACLES
  const fixedNativePO = await deployments.deploy("FixedNativePriceOracle", {
    from: deployer,
    args: [],
    log: true
  });
  console.log("FixedNativePriceOracle: ", fixedNativePO.address);

  try {
    const simplePO = await deployments.deploy("SimplePriceOracle", {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: []
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      },
      waitConfirmations: 1
    });
    if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
    console.log("SimplePriceOracle: ", simplePO.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  try {
    await deployments.deploy("MasterPriceOracle", {
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [
              [constants.AddressZero, chainDeployParams.wtoken],
              [fixedNativePO.address, fixedNativePO.address],
              constants.AddressZero,
              deployer,
              true,
              chainDeployParams.wtoken
            ]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      },
      waitConfirmations: 1
    });
    console.log(
      `Initialised MPO with for tokens: ${constants.AddressZero}: ${fixedNativePO.address}, ${chainDeployParams.wtoken}: ${fixedNativePO.address}`
    );
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;
