import { task, types } from "hardhat/config";
import { Hash } from "viem";

task("plugin:deploy", "Deploy ERC4626 Strategy")
  .addParam("contractName", "Name of the ERC4626 strategy", undefined, types.string)
  .addParam("deploymentName", "Name of the ERC4626 contract", undefined, types.string)
  .addParam("underlying", "Address of the underlying token", undefined, types.string)
  .addParam("creator", "Deployer Address", "deployer", types.string)
  .addOptionalParam(
    "otherParams",
    "other params that might be required to construct the strategy",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const otherParams = taskArgs.otherParams ? taskArgs.otherParams.split(",") : null;
    let deployArgs;
    if (otherParams) {
      deployArgs = [taskArgs.underlying, ...otherParams];
    } else {
      deployArgs = [taskArgs.underlying];
    }

    const deployment = await deployments.deploy(taskArgs.deploymentName, {
      contract: taskArgs.contractName,
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: deployArgs
          }
        },
        owner: deployer
      },
      log: true
    });

    if (deployment.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: deployment.transactionHash as Hash });

    console.log("ERC4626 Strategy: ", deployment.address);
    return deployment.address;
  });
