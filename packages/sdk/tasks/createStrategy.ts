import { task, types } from "hardhat/config";

// npx hardhat strategy:create --strategy-name AlpacaERC4626 --underlying "" --name Plugin-Alpaca-USDC --symbol pAlUSDC --creator deployer --other-params "" --network localhost

task("strategy:create", "Create ERC4626 Strategy")
  .addParam("strategyName", "Name of the ERC4626 strategy", undefined, types.string)
  .addParam("contractName", "Name of the ERC4626 contract", undefined, types.string)
  .addParam("underlying", "Address of the underlying token", undefined, types.string)
  .addParam("creator", "Deployer Address", "deployer", types.string)
  .addOptionalParam(
    "otherParams",
    "other params that might be required to construct the strategy",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.creator);
    const contract = taskArgs.contractName;

    const otherParams = taskArgs.otherParams ? taskArgs.otherParams.split(",") : null;
    let deployArgs;
    if (otherParams) {
      deployArgs = [taskArgs.underlying, ...otherParams];
    } else {
      deployArgs = [taskArgs.underlying];
    }

    const deployment = await hre.deployments.deploy(taskArgs.strategyName, {
      contract,
      from: signer.address,
      args: deployArgs,
      log: true,
    });

    if (deployment.transactionHash) await hre.ethers.provider.waitForTransaction(deployment.transactionHash);

    console.log("ERC4626 Strategy: ", deployment.address);
  });
