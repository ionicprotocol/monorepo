import { task, types } from "hardhat/config";
import { SupportedAsset } from "../../chainDeploy";
import { underlying } from "../../chainDeploy/helpers/utils";
import { Address, Hash } from "viem";

const underlyingsMapping: Record<string, SupportedAsset[]> = {};

task("deploy-static-rewards-market", "deploy dynamic rewards plugin with flywheels")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("contractName", "Name of the contract of the plugin", undefined, types.string)
  .addParam("pluginExtraParams", "Extra plugin parameters", undefined, types.string)
  .setAction(async (taskArgs, { run, viem, deployments, getChainId, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const underlyings = underlyingsMapping[chainId];

    // task argument parsing
    const comptroller: Address = taskArgs.comptroller;
    const contractName = taskArgs.contractName;
    const pluginExtraParams = taskArgs.pluginExtraParams.split(",");
    const symbol = taskArgs.symbol;

    const underlyingAddress = underlying(underlyings, symbol);
    const market = await viem.getContractAt("IonicComptroller", comptroller);
    const marketAddress = await market.read.cTokensByUnderlying([underlyingAddress]);
    const cToken = await viem.getContractAt("ICErc20PluginRewards", marketAddress);

    const cTokenImplementation = await cToken.read.implementation();
    console.log({ underlyingAddress, marketAddress, cTokenImplementation });
    const deployArgs = [underlyingAddress, ...pluginExtraParams];

    // STEP 1: deploy plugins
    console.log(`Deploying plugin with arguments: ${JSON.stringify({ deployArgs })}`);
    const deployment = await deployments.deploy(`${contractName}_${symbol}_${marketAddress}`, {
      contract: contractName,
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

    const pluginAddress = deployment.address as Address;

    console.log(`Plugin deployed successfully: ${pluginAddress}`);

    const plugin = await viem.getContractAt(contractName, pluginAddress);
    const pluginAsset = await plugin.read.asset();

    console.log(`Plugin asset: ${pluginAsset}`);

    if (pluginAsset !== underlyingAddress) {
      throw new Error(`Plugin asset: ${pluginAsset} does not match underlying asset: ${underlyingAddress}`);
    }
    console.log({ pluginAddress: plugin.address });

    // STEP 2: upgrade markets to the new implementation
    console.log(`Upgrading market: ${underlyingAddress} to CErc20PluginDelegate with plugin: ${pluginAddress}`);
    await run("market:upgrade", {
      comptroller,
      underlying: underlyingAddress,
      implementationAddress: (await deployments.get("CErc20PluginDelegate")).address,
      pluginAddress: pluginAddress,
      signer: taskArgs.signer
    });
    console.log("Market upgraded");
  });
