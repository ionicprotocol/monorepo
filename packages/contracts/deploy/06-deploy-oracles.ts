import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { Hash, zeroAddress } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });

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
    if (simplePO.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: simplePO.transactionHash as Hash });
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
              [zeroAddress, chainDeployParams.wtoken],
              [fixedNativePO.address, fixedNativePO.address],
              zeroAddress,
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
      `Initialised MPO with for tokens: ${zeroAddress}: ${fixedNativePO.address}, ${chainDeployParams.wtoken}: ${fixedNativePO.address}`
    );
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["prod", "deploy-oracles"];

export default func;
