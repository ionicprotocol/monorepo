import { bsc, evmos, moonbeam, polygon } from "@ionicprotocol/chains";
import { underlying } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

const underlyingsMapping = {
  [bsc.chainId]: bsc.assets,
  [moonbeam.chainId]: moonbeam.assets,
  [polygon.chainId]: polygon.assets,
  [evmos.chainId]: evmos.assets,
};

task("deploy-dynamic-rewards-market", "deploy dynamic rewards plugin with flywheels")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("contractName", "Name of the contract of the plugin", undefined, types.string)
  .addParam("fwAddresses", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("rewardTokens", "Reward tokens", undefined, types.string)
  .addOptionalParam("pluginExtraParams", "Extra plugin parameters", undefined, types.string)
  .setAction(async (taskArgs, { run, ethers, deployments }) => {
    const signer = await ethers.getNamedSigner(taskArgs.signer);

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();
    const underlyings = underlyingsMapping[sdk.chainId];

    // task argument parsing
    const comptroller = taskArgs.comptroller;
    const contractName = taskArgs.contractName;
    const pluginExtraParams = taskArgs.pluginExtraParams ? taskArgs.pluginExtraParams.split(",") : [];
    const rewardTokens = taskArgs.rewardTokens.split(",");
    const fwAddresses = taskArgs.fwAddresses.split(",");
    const symbol = taskArgs.symbol;

    const underlyingAddress = underlying(underlyings, symbol);
    const marketAddress = await sdk
      .createComptroller(comptroller, signer)
      .callStatic.cTokensByUnderlying(underlyingAddress);
    const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress, signer);

    const cTokenImplementation = await cToken.callStatic.implementation();
    console.log({ marketAddress });
    const deployArgs = [underlyingAddress, ...pluginExtraParams, marketAddress, fwAddresses[0]];

    // STEP 1: deploy plugins
    console.log(`Deploying plugin with arguments: ${JSON.stringify({ deployArgs })}`);
    const artifact = await deployments.getArtifact(contractName);
    const deployment = await deployments.deploy(`${contractName}_${symbol}_${marketAddress}`, {
      contract: artifact,
      from: signer.address,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: deployArgs,
          },
        },
        owner: signer.address,
      },
      log: true,
    });

    console.log(deployment.transactionHash);
    if (deployment.transactionHash) await ethers.provider.waitForTransaction(deployment.transactionHash);

    const pluginAddress = deployment.address;
    console.log(`Plugin deployed successfully: ${pluginAddress}`);

    const plugin = await ethers.getContractAt(contractName, pluginAddress, signer);
    const pluginAsset = await plugin.callStatic.asset();
    console.log(`Plugin asset: ${pluginAsset}`);

    if (pluginAsset !== underlyingAddress) {
      throw new Error(`Plugin asset: ${pluginAsset} does not match underlying asset: ${underlyingAddress}`);
    }
    console.log({ pluginAddress: plugin.address });

    // STEP 2: whitelist plugins
    console.log(`Whitelisting plugin: ${pluginAddress} ...`);
    await run("plugin:whitelist", {
      oldImplementation: pluginAddress,
      newImplementation: pluginAddress,
      admin: taskArgs.signer,
    });

    // STEP 3: whitelist upgradfe path from CErc20Delegate-> CErc20PluginRewardsDelegate
    console.log(
      `Whitelisting upgrade path from CErc20Delegate: ${cTokenImplementation} -> CErc20PluginRewardsDelegate: ${sdk.chainDeployment.CErc20PluginRewardsDelegate.address}`
    );
    await run("market:updatewhitelist", {
      oldPluginRewardsDelegate: cTokenImplementation,
      admin: taskArgs.signer,
    });
    console.log("Upgrade path whitelisted");

    // STEP 4: upgrade markets to the new implementation
    console.log(`Upgrading market: ${underlyingAddress} to CErc20PluginRewardsDelegate with plugin: ${pluginAddress}`);
    await run("market:upgrade", {
      comptroller,
      underlying: underlyingAddress,
      implementationAddress: sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
      pluginAddress: pluginAddress,
      signer: taskArgs.signer,
    });
    console.log("Market upgraded");

    // for each token and its flywheel, set up the market and its rewards
    for (const [idx, rewardToken] of rewardTokens.entries()) {
      console.log(`Setting up market for reward token: ${rewardToken}, fwAddress: ${fwAddresses[idx]}`);
      const flywheel = sdk.createIonicFlywheel(fwAddresses[idx]);
      const tokenRewards = await flywheel.callStatic.flywheelRewards();
      console.log(`token rewards ${tokenRewards}`);

      // Step 1: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
      const approveRewardTx = await cToken["approve(address,address)"](rewardToken, tokenRewards);
      const approveRewardReceipt = await approveRewardTx.wait();
      console.log(`ctoken approved for rewards for ${rewardToken}`, approveRewardReceipt.status, approveRewardTx.hash);

      // Step 2: enable marketAddress on flywheels
      try {
        const fwAddTx = await flywheel.addStrategyForRewards(marketAddress);
        const feAddTxResult = await fwAddTx.wait(2);
        console.log("enabled market on FW with status: ", feAddTxResult.status);
      } catch (e) {
        console.log(marketAddress, "already added");
        console.log(e);
      }
      // Step 3: add Flywheels to market
      try {
        await sdk.addFlywheelCoreToComptroller(flywheel.address, comptroller);
        console.log(`FW ${flywheel.address} added to comptroller`);
      } catch (e) {
        console.log("already added");
        console.log(e);
      }
    }
  });
