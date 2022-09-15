import { bsc, moonbeam, polygon } from "@midas-capital/chains";
import { task, types } from "hardhat/config";

const underlyingsMapping = {
  [bsc.chainId]: bsc.assets,
  [moonbeam.chainId]: moonbeam.assets,
  [polygon.chainId]: polygon.assets,
};

task("deploy-dynamic-rewards-market", "deploy dynamic rewards plugin with flywheels")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("contractName", "Name of the contract of the plugin", undefined, types.string)
  .addParam("pluginExtraParams", "Extra plugin parameters", undefined, types.string)
  .addParam("fwAddresses", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("rewardTokens", "Reward tokens", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const underlyings = underlyingsMapping[sdk.chainId];

    // task argument parsing
    const comptroller = taskArgs.comptroller;
    const contractName = taskArgs.contractName;
    const pluginExtraParams = taskArgs.pluginExtraParams.split(",");
    const rewardTokens = taskArgs.rewardTokens.split(",");
    const fwAddresses = taskArgs.fwAddresses.split(",");
    const symbol = taskArgs.symbol;

    const underlying = underlyings.find((a) => a.symbol === symbol)!.underlying;
    const marketAddress = await sdk.createComptroller(comptroller, signer).callStatic.cTokensByUnderlying(underlying);
    const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);

    const cTokenImplementation = await cToken.callStatic.implementation();
    console.log({ marketAddress });
    const deployArgs = [underlying, ...fwAddresses, ...pluginExtraParams, marketAddress, rewardTokens];

    // STEP 1: deploy plugins
    console.log(`Deploying plugin with arguments: ${JSON.stringify({ deployArgs })}`);
    const pluginContract = await hre.ethers.getContractFactory(contractName, signer);
    const pluginDeployment = await pluginContract.deploy();
    console.log(pluginDeployment.deployTransaction.hash);
    if (pluginDeployment.deployTransaction.hash)
      await hre.ethers.provider.waitForTransaction(pluginDeployment.deployTransaction.hash);

    console.log(`Plugin deployed successfully: ${pluginDeployment.address}`);
    const plugin = await hre.ethers.getContractAt(contractName, pluginDeployment.address, signer);

    const _asset = await plugin.asset();

    if (_asset === hre.ethers.constants.AddressZero) {
      const tx = await plugin.initialize(...deployArgs);
      await tx.wait();
      console.log(`Plugin initialised with status: ${tx.status} - ${tx.hash}`);
    }

    // STEP 2: whitelist plugins
    console.log(`Whitelisting plugin: ${pluginDeployment.address} ...`);
    await hre.run("plugin:whitelist", {
      oldImplementation: pluginDeployment.address,
      newImplementation: pluginDeployment.address,
      admin: taskArgs.signer,
    });

    // STEP 3: whitelist upgradfe path from CErc20Delegate-> CErc20PluginRewardsDelegate
    console.log(
      `Whitelisting upgrade path from CErc20Delegate: ${cTokenImplementation} -> CErc20PluginRewardsDelegate: ${sdk.chainDeployment.CErc20PluginRewardsDelegate.address}`
    );
    await hre.run("market:updatewhitelist", {
      oldPluginRewardsDelegate: cTokenImplementation,
      admin: taskArgs.signer,
    });
    console.log("Upgrade path whitelisted");

    // STEP 4: upgrade markets to the new implementation
    console.log(
      `Upgrading market: ${underlying} to CErc20PluginRewardsDelegate with plugin: ${pluginDeployment.address}`
    );
    await hre.run("market:upgrade", {
      comptroller,
      underlying,
      implementationAddress: sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
      pluginAddress: pluginDeployment.address,
      signer: taskArgs.signer,
    });
    console.log("Market upgraded");

    // for each token and its flywheel, set up the market and its rewards
    for (const [idx, rewardToken] of rewardTokens.entries()) {
      const flywheel = sdk.createMidasFlywheel(fwAddresses[idx]);
      const tokenRewards = await flywheel.callStatic.flywheelRewards();

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
