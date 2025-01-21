import { DeployFunction } from "hardhat-deploy/types";
import { Hash } from "viem";
import { chainIdtoChain } from "@ionicprotocol/chains";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });

  let fpd;
  try {
    fpd = await deployments.deploy("PoolDirectory", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [false, []]
          }
        },
        owner: multisig
      },
      waitConfirmations: 1
    });
    if (fpd.transactionHash) await publicClient.waitForTransactionReceipt({ hash: fpd.transactionHash as Hash });
    console.log("PoolDirectory: ", fpd.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["prod", "deply-pool-directory"];

export default func;
