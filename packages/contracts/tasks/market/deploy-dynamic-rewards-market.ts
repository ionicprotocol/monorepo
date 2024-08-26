import { task, types } from "hardhat/config";
import { underlying } from "../../chainDeploy/helpers/utils";
import { Address, Hash } from "viem";
import { SupportedAsset } from "../../chainDeploy";

const underlyingsMapping: Record<number, SupportedAsset[]> = {};

task("deploy-dynamic-rewards-market", "deploy dynamic rewards plugin with flywheels")
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("contractName", "Name of the contract of the plugin", undefined, types.string)
  .addParam("fwAddresses", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("rewardTokens", "Reward tokens", undefined, types.string)
  .addOptionalParam("pluginExtraParams", "Extra plugin parameters", undefined, types.string)
  .setAction(async (taskArgs, { run, viem, deployments, getNamedAccounts, getChainId }) => {
    const chainId = parseInt(await getChainId());
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const underlyings = underlyingsMapping[chainId];

    // task argument parsing
    const comptroller = taskArgs.comptroller;
    const contractName = taskArgs.contractName;
    const pluginExtraParams = taskArgs.pluginExtraParams ? taskArgs.pluginExtraParams.split(",") : [];
    const rewardTokens = taskArgs.rewardTokens.split(",");
    const fwAddresses = taskArgs.fwAddresses.split(",");
    const symbol = taskArgs.symbol;

    const underlyingAddress = underlying(underlyings, symbol);
    const market = await viem.getContractAt("IonicComptroller", comptroller as Address);
    const marketAddress = await market.read.cTokensByUnderlying([underlyingAddress]);
    const cToken = await viem.getContractAt("ICErc20PluginRewards", marketAddress);

    console.log({ marketAddress });
    const deployArgs = [underlyingAddress, ...pluginExtraParams, marketAddress, fwAddresses[0]];

    // STEP 1: deploy plugins
    console.log(`Deploying plugin with arguments: ${JSON.stringify({ deployArgs })}`);
    const artifact = await deployments.getArtifact(contractName);
    const deployment = await deployments.deploy(`${contractName}_${symbol}_${marketAddress}`, {
      contract: artifact,
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

    console.log(deployment.transactionHash);
    if (deployment.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: deployment.transactionHash as Hash });

    const pluginAddress = deployment.address;
    console.log(`Plugin deployed successfully: ${pluginAddress}`);

    const plugin = await viem.getContractAt(contractName, pluginAddress as Address);
    const pluginAsset = await plugin.read.asset();
    console.log(`Plugin asset: ${pluginAsset}`);

    if (pluginAsset !== underlyingAddress) {
      throw new Error(`Plugin asset: ${pluginAsset} does not match underlying asset: ${underlyingAddress}`);
    }
    console.log({ pluginAddress: plugin.address });

    // STEP 2: upgrade markets to the new implementation
    console.log(`Upgrading market: ${underlyingAddress} to CErc20PluginRewardsDelegate with plugin: ${pluginAddress}`);
    await run("market:upgrade", {
      comptroller,
      underlying: underlyingAddress,
      implementationAddress: (await deployments.get("CErc20PluginRewardsDelegate")).address,
      pluginAddress: pluginAddress,
      signer: taskArgs.signer
    });
    console.log("Market upgraded");

    // for each token and its flywheel, set up the market and its rewards
    for (const [idx, rewardToken] of rewardTokens.entries()) {
      console.log(`Setting up market for reward token: ${rewardToken}, fwAddress: ${fwAddresses[idx]}`);
      const flywheel = await viem.getContractAt("IonicFlywheel", fwAddresses[idx]);
      const tokenRewards = await flywheel.read.flywheelRewards();
      console.log(`token rewards ${tokenRewards}`);

      // Step 1: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
      const approveRewardTx = await cToken.write.approve([rewardToken, tokenRewards]);
      const approveRewardReceipt = await publicClient.waitForTransactionReceipt({ hash: approveRewardTx });
      console.log(`ctoken approved for rewards for ${rewardToken}`, approveRewardReceipt.status, approveRewardTx);

      // Step 2: enable marketAddress on flywheels
      try {
        const fwAddTx = await flywheel.write.addStrategyForRewards([marketAddress]);
        const feAddTxResult = await publicClient.waitForTransactionReceipt({ hash: fwAddTx, confirmations: 2 });
        console.log("enabled market on FW with status: ", feAddTxResult.status);
      } catch (e) {
        console.log(marketAddress, "already added");
        console.log(e);
      }
      // Step 3: add Flywheels to market
      try {
        const _comptroller = await viem.getContractAt("IonicComptroller", comptroller as Address);
        const tx = await _comptroller.write._addRewardsDistributor([flywheel.address]);
        console.log(`FW ${flywheel.address} added to comptroller: ${tx}`);
      } catch (e) {
        console.log("already added");
        console.log(e);
      }
    }
  });
