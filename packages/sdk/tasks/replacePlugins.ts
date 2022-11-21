import { arbitrum, bsc, chapel, fantom, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig, DeployedPlugins } from "@midas-capital/types";
import { task, types } from "hardhat/config";

import { CErc20PluginRewardsDelegate } from "../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../lib/contracts/typechain/FuseFeeDistributor";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [fantom.chainId]: fantom,
  [ganache.chainId]: ganache,
};

task("plugins:deploy:upgradable", "Deploys the upgradable plugins from a config list").setAction(
  async ({}, { ethers, getChainId, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    console.log({ deployer: deployer.address });
    const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

    const chainid = await getChainId();
    const pluginConfigs: DeployedPlugins = chainIdToConfig[chainid].deployedPlugins;

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];

    const pluginAddresses = Object.keys(pluginConfigs);

    for (const pluginAddress of pluginAddresses) {
      const conf = pluginConfigs[pluginAddress];
      console.log({ conf });

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
        const tx = await market._updatePlugin(newPluginAddress);
        await tx.wait();
        console.log(`plugin changed with ${tx.hash}`);
      }
    } catch (e) {
      console.log(`market ${marketAddress} is probably not a plugin market`, e);
    }
  });
