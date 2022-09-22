import { chainIdToConfig } from "@midas-capital/chains";
import { DeployedPlugins } from "@midas-capital/types";
import { task, types } from "hardhat/config";

import { CErc20PluginRewardsDelegate } from "../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../lib/contracts/typechain/FuseFeeDistributor";

task("plugins:deploy:upgradable", "Deploys the upgradable plugins from a config list").setAction(
  async ({}, { ethers, getChainId, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

    const chainid = await getChainId();
    const pluginConfigs: DeployedPlugins = chainIdToConfig[chainid].deployedPlugins;

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];

    for (const pluginAddress in pluginConfigs) {
      const conf = pluginConfigs[pluginAddress];
      console.log(conf);

      const market = (await ethers.getContractAt(
        "CErc20PluginRewardsDelegate",
        conf.market
      )) as CErc20PluginRewardsDelegate;

      const currentPlugin = await market.callStatic.plugin();
      if (currentPlugin != pluginAddress) throw new Error(`wrong plugin address/config for market ${conf.market}`);
      oldImplementations.push(currentPlugin);

      let deployArgs;
      if (conf.otherParams) {
        deployArgs = [conf.underlying, ...conf.otherParams];
      } else {
        deployArgs = [conf.underlying];
      }

      console.log(deployArgs);
      const contractId = `${conf.strategy}_${conf.market}`;
      console.log(contractId);

      const artifact = await deployments.getArtifact(conf.strategy);
      const deployment = await deployments.deploy(contractId, {
        contract: artifact,
        from: deployer.address,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: deployArgs,
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [],
            },
          },
          owner: deployer.address,
        },
        log: true,
      });

      if (deployment.transactionHash) await ethers.provider.waitForTransaction(deployment.transactionHash);
      console.log("ERC4626 Strategy: ", deployment.address);

      newImplementations.push(deployment.address);
      arrayOfTrue.push(true);
    }

    const tx = await ffd._editPluginImplementationWhitelist(oldImplementations, newImplementations, arrayOfTrue);
    await tx.wait();
    console.log("_editPluginImplementationWhitelist: ", tx.hash);

    for (const pluginAddress in pluginConfigs) {
      const conf = pluginConfigs[pluginAddress];
      console.log(conf);

      const market = (await ethers.getContractAt(
        "CErc20PluginRewardsDelegate",
        conf.market,
        deployer
      )) as CErc20PluginRewardsDelegate;

      const comptrollerAddress = await market.callStatic.comptroller();

      const comptroller = (await ethers.getContractAt(
        "Comptroller.sol:Comptroller",
        comptrollerAddress,
        deployer
      )) as Comptroller;

      const admin = await comptroller.callStatic.admin();
      if (admin == deployer.address) {
        const currentPluginAddress = await market.callStatic.plugin();
        const contractId = `${conf.strategy}_${conf.market}`;
        const newPlugin = await ethers.getContract(contractId);
        const newPluginAddress = newPlugin.address;

        if (currentPluginAddress != newPluginAddress) {
          console.log(`changing ${currentPluginAddress} with ${newPluginAddress}`);
          const tx = await market._updatePlugin(newPluginAddress);
          await tx.wait();
          console.log("_updatePlugin: ", tx.hash);
        }
      } else {
        console.log(`market poll has a different admin ${admin}`);
      }
    }
  }
);

// npx hardhat plugins:change --market 0x6dDF9A3b2DE1300bB2B99277716e4E574DB3a871 --new-plugin 0x43fa05d9D56c44d7a697Ac458CC16707A545183B --network polygon
// npx hardhat plugins:change --market 0xCC7eab2605972128752396241e46C281e0405a27 --new-plugin 0x9F82D802FB4940743C543041b86220A9096A7522 --network polygon

task("plugins:change", "Replaces an old plugin contract with a new one")
  .addParam("market", "The address of the market", undefined, types.string)
  .addParam("newPlugin", "The address of the new plugin", undefined, types.string)
  .setAction(async ({ market: marketAddress, newPlugin: newPluginAddress }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const market = (await ethers.getContractAt(
      "CErc20PluginRewardsDelegate",
      marketAddress,
      deployer
    )) as CErc20PluginRewardsDelegate;
    try {
      const currentPluginAddress = await market.callStatic.plugin();
      if (currentPluginAddress != newPluginAddress) {
        console.log(`changing ${currentPluginAddress} with ${newPluginAddress}`);
        await market._updatePlugin(newPluginAddress);
      }
    } catch (e) {
      console.log(`market ${marketAddress} is probably not a plugin market`, e);
    }
  });
