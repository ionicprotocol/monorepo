// import { task, types } from "hardhat/config";
// import { chainIdToConfig } from "../../chains";
// import { DeployedPlugins } from "../../chainDeploy";

// task("plugins:deploy:upgradable", "Deploys the upgradable plugins from a config list").setAction(
//   async ({}, { viem, getChainId, deployments }) => {
//     const deployer = await ethers.getNamedSigner("deployer");

//     console.log({ deployer: deployer.address });

//     const chainid = parseInt(await getChainId());
//     const pluginConfigs: DeployedPlugins = chainIdToConfig[chainid].deployedPlugins;

//     const pluginAddresses = Object.keys(pluginConfigs);

//     for (const pluginAddress of pluginAddresses) {
//       const conf = pluginConfigs[pluginAddress];
//       console.log({ conf });

//       let deployArgs;
//       if (conf?.otherParams) {
//         deployArgs = [conf.underlying, ...conf.otherParams];
//       } else {
//         deployArgs = [conf.underlying];
//       }

//       console.log(deployArgs);
//       const contractId = `${conf.strategy}_${conf.market}`;
//       console.log(contractId);

//       const artifact = await deployments.getArtifact(conf.strategy);
//       const deployment = await deployments.deploy(contractId, {
//         contract: artifact,
//         from: deployer.address,
//         proxy: {
//           proxyContract: "OpenZeppelinTransparentProxy",
//           execute: {
//             init: {
//               methodName: "initialize",
//               args: deployArgs
//             }
//           },
//           owner: deployer.address
//         },
//         log: true
//       });

//       if (deployment.transactionHash) await ethers.provider.waitForTransaction(deployment.transactionHash);
//       console.log("ERC4626 Strategy: ", deployment.address);
//     }

//     for (const pluginAddress in pluginConfigs) {
//       const conf = pluginConfigs[pluginAddress];
//       console.log(conf);

//       const market = (await ethers.getContractAt(
//         "CErc20PluginRewardsDelegate",
//         conf.market,
//         deployer
//       )) as CErc20PluginRewardsDelegate;

//       const comptrollerAddress = await market.callStatic.comptroller();

//       const comptroller = (await ethers.getContractAt(
//         "Comptroller.sol:Comptroller",
//         comptrollerAddress,
//         deployer
//       )) as Comptroller;

//       const admin = await comptroller.callStatic.admin();
//       if (admin == deployer.address) {
//         const currentPluginAddress = await market.callStatic.plugin();
//         const contractId = `${conf.strategy}_${conf.market}`;
//         const newPlugin = await ethers.getContract(contractId);
//         const newPluginAddress = newPlugin.address;

//         if (currentPluginAddress != newPluginAddress) {
//           console.log(`changing ${currentPluginAddress} with ${newPluginAddress}`);
//           const tx = await market._updatePlugin(newPluginAddress);
//           await tx.wait();
//           console.log("_updatePlugin: ", tx.hash);
//         }
//       } else {
//         console.log(`market poll has a different admin ${admin}`);
//       }
//     }
//   }
// );

// task("plugins:replace", "Replaces an old plugin contract with a new one")
//   .addParam("market", "The address of the market", undefined, types.string)
//   .addParam("newPlugin", "The address of the new plugin", undefined, types.string)
//   .setAction(async ({ market: marketAddress, newPlugin: newPluginAddress }, { ethers }) => {
//     const deployer = await ethers.getNamedSigner("deployer");

//     const market = (await ethers.getContractAt(
//       "CErc20PluginRewardsDelegate",
//       marketAddress,
//       deployer
//     )) as CErc20PluginRewardsDelegate;
//     try {
//       const currentPluginAddress = await market.callStatic.plugin();
//       if (currentPluginAddress != newPluginAddress) {
//         console.log(`changing ${currentPluginAddress} with ${newPluginAddress}`);
//         const tx = await market._updatePlugin(newPluginAddress);
//         await tx.wait();
//         console.log(`plugin changed with ${tx.hash}`);
//       }
//     } catch (e) {
//       console.log(`market ${marketAddress} is probably not a plugin market`, e);
//     }
//   });

// task("plugin:set-fee-recipient")
//   .addParam("pluginAddress", "Plugin address", undefined, types.string)
//   .addParam("feeRecipient", "Fee recipient address", undefined, types.string)
//   .setAction(async ({ pluginAddress, feeRecipient }, { ethers }) => {
//     const deployer = await ethers.getNamedSigner("deployer");

//     const plugin = (await ethers.getContractAt("IonicERC4626", pluginAddress, deployer)) as IonicERC4626;

//     const currentFee = await plugin.callStatic.performanceFee();
//     const currentFr = await plugin.callStatic.feeRecipient();

//     if (currentFr.toLowerCase() !== feeRecipient.toLowerCase()) {
//       console.log(`updating the fee recipient to ${feeRecipient} for plugin ${pluginAddress}`);
//       const tx = await plugin.updateFeeSettings(currentFee, feeRecipient);
//       await tx.wait();
//       console.log(`mined tx ${tx.hash}`);
//     } else {
//       console.log(`already set to ${currentFr}`);
//     }
//   });
