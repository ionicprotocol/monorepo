import { bsc, polygon } from "@ionicprotocol/chains";
import { underlying } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

const underlyingsMapping = {
  [bsc.chainId]: bsc.assets,
  [polygon.chainId]: polygon.assets
};

// yarn workspace @ionicprotocol/sdk deploy-dynamic-rewards-market
// --comptroller 0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2
// --symbol "EURE-JEUR"
// --contract-name BeefyERC4626
// --plugin-extra-params "0x58a3e6d5501180fb9fcE7cFC2368F9Dc5e186A6f,0"
// --network polygon

task("deploy-static-rewards-market", "deploy dynamic rewards plugin with flywheels")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("contractName", "Name of the contract of the plugin", undefined, types.string)
  .addParam("pluginExtraParams", "Extra plugin parameters", undefined, types.string)
  .setAction(async (taskArgs, { run, ethers, deployments }) => {
    const signer = await ethers.getNamedSigner(taskArgs.signer);
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const underlyings = underlyingsMapping[sdk.chainId];

    // task argument parsing
    const comptroller = taskArgs.comptroller;
    const contractName = taskArgs.contractName;
    const pluginExtraParams = taskArgs.pluginExtraParams.split(",");
    const symbol = taskArgs.symbol;

    const underlyingAddress = underlying(underlyings, symbol);
    const marketAddress = await sdk
      .createComptroller(comptroller, signer)
      .callStatic.cTokensByUnderlying(underlyingAddress);

    const cToken = await sdk.createICErc20PluginRewards(marketAddress);

    const cTokenImplementation = await cToken.callStatic.implementation();
    console.log({ underlyingAddress, marketAddress, cTokenImplementation });
    const deployArgs = [underlyingAddress, ...pluginExtraParams];

    // STEP 1: deploy plugins
    console.log(`Deploying plugin with arguments: ${JSON.stringify({ deployArgs })}`);
    const deployment = await deployments.deploy(`${contractName}_${symbol}_${marketAddress}`, {
      contract: contractName,
      from: signer.address,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: deployArgs
          }
        },
        owner: signer.address
      },
      log: true
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
      admin: taskArgs.signer
    });

    // STEP 3: whitelist upgradfe path from CErc20Delegate-> CErc20PluginRewardsDelegate
    console.log(
      `Whitelisting upgrade path from CErc20Delegate: ${cTokenImplementation} -> CErc20PluginDelegate: ${sdk.chainDeployment.CErc20PluginDelegate.address}`
    );
    await run("market:updatewhitelist", {
      oldPluginDelegate: cTokenImplementation,
      admin: taskArgs.signer
    });

    console.log("Upgrade path whitelisted");

    // STEP 4: upgrade markets to the new implementation
    console.log(`Upgrading market: ${underlyingAddress} to CErc20PluginDelegate with plugin: ${pluginAddress}`);
    await run("market:upgrade", {
      comptroller,
      underlying: underlyingAddress,
      implementationAddress: sdk.chainDeployment.CErc20PluginDelegate.address,
      pluginAddress: pluginAddress,
      signer: taskArgs.signer
    });
    console.log("Market upgraded");
  });
