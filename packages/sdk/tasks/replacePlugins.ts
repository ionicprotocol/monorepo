import { bsc } from "@midas-capital/chains";
import { assetSymbols } from "@midas-capital/types";
import { ethers } from "ethers";
import { task, types } from "hardhat/config";

import { PluginConfig } from "../chainDeploy";
import { ArrakisERC4626 } from "../lib/contracts/typechain/ArrakisERC4626.sol";
import { BeefyERC4626 } from "../lib/contracts/typechain/BeefyERC4626.sol";
import { CErc20PluginRewardsDelegate } from "../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../lib/contracts/typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../lib/contracts/typechain/FusePoolDirectory";

export default task("plugins:identify", "Prints the markets with plugins and the relevant plugin ID").setAction(
  async ({}, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const contractIds = [];
    const plugins = [];

    for (const pluginAddress in bsc.deployedPlugins) {
      if (pluginAddress) {
        const pluginData = bsc.deployedPlugins[pluginAddress];
        contractIds.push(pluginData.strategy);
        plugins.push(pluginAddress);
      }
    }

    console.log(`got plugins ${plugins}`);
    console.log(`got contract ids ${contractIds}`);

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const pools = await fusePoolDirectory.callStatic.getAllPools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool ", pool.name, pool.comptroller);
      const comptroller = (await ethers.getContractAt("Comptroller", pool.comptroller, deployer)) as Comptroller;

      const markets = await comptroller.callStatic.getAllMarkets();
      for (let j = 0; j < markets.length; j++) {
        const marketAddress = markets[j];
        const market = (await ethers.getContractAt(
          "CErc20PluginRewardsDelegate",
          marketAddress,
          deployer
        )) as CErc20PluginRewardsDelegate;

        console.log(`marketAddress ${marketAddress}`);
        try {
          const currentPluginAddress = await market.callStatic.plugin();
          console.log(`plugin address ${currentPluginAddress}`);
          const underlying = await market.callStatic.underlying();
          console.log(`for ${underlying}`);

          const marketName = await market.callStatic.name();
          console.log(`marketName ${marketName}`);
          try {
            const currentPlugin = (await ethers.getContractAt(
              "BeefyERC4626",
              currentPluginAddress,
              deployer
            )) as BeefyERC4626;
            const beefyVault = await currentPlugin.callStatic.beefyVault();
            const withdrawalFee = await currentPlugin.callStatic.withdrawalFee();

            console.log({ market: marketAddress, underlying, beefyVault, fee: withdrawalFee.toNumber() });
          } catch (err) {
            // ignore
          }
          try {
            const currentPlugin = (await ethers.getContractAt(
              "ArrakisERC4626",
              currentPluginAddress,
              deployer
            )) as ArrakisERC4626;
            const pool = await currentPlugin.callStatic.pool();
            const flywheel = await currentPlugin.callStatic.flywheel();
            const rewardDestination = await currentPlugin.callStatic.rewardDestination();

            let k = 0;
            while (true) {
              try {
                const rewardToken = await currentPlugin.callStatic.rewardTokens(k++);
                console.log(`reward token ${k} ${rewardToken}`);
              } catch (error) {
                break;
              }
            }
            console.log({ market: marketAddress, underlying, pool, flywheel, rewardDestination });
          } catch (err) {
            // ignore
          }
          console.log();
        } catch (e) {
          console.log(`market ${marketAddress} is probably not a plugin market`);
        }
      }

      console.log();
    }
  }
);

task("plugins:deploy:upgradable", "Deploys the upgradable plugins from a config list").setAction(
  async ({}, { ethers, getChainId, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

    const chainid = await getChainId();
    const pluginConfigs = getPluginConfigs(new ethers.utils.AbiCoder(), chainid);

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];

    for (let i = 0; i < pluginConfigs.length; i++) {
      const conf = pluginConfigs[i];
      console.log(conf);

      const market = (await ethers.getContractAt(
        "CErc20PluginRewardsDelegate",
        conf.market,
        deployer
      )) as CErc20PluginRewardsDelegate;

      const oldPlugin = await market.callStatic.plugin();
      oldImplementations.push(oldPlugin);

      let deployArgs;
      if (conf.otherParams) {
        deployArgs = [conf.underlying, ...conf.otherParams];
      } else {
        deployArgs = [conf.underlying];
      }

      console.log(deployArgs);
      const contractId = `${conf.strategy}_${conf.market}`;
      console.log(contractId);

      const deployment = await deployments.deploy(contractId, {
        contract: conf.strategy,
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
  }
);

function getPluginConfigs(abicoder: ethers.utils.AbiCoder, chainid: string): PluginConfig[] {
  let assets;
  if (chainid == "56") {
    assets = bsc.assets;

    return [
      {
        strategy: "BombERC4626",
        underlying: "0x522348779DCb2911539e76A1042aA922F9C47Ee3", // BOMB
        otherParams: ["0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b"], // xBOMB
        name: "BOMBxBOMB",
        market: "0x34ea4cbb464E6D120B081661464d4635Ca237FA7",
      },
      {
        strategy: "DotDotLpERC4626",
        underlying: assets.find((a) => a.symbol === assetSymbols["2brl"])!.underlying, // 2BRL
        otherParams: [
          "", // _dddFlywheel // TODO
          "", // _epxFlywheel // TODO
          "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
          "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba", // _rewardsDestination
          abicoder.encode(
            ["address[]"],
            [["0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", "0x84c97300a190676a19D1E13115629A11f8482Bd1"]]
          ), // _rewardTokens
        ],
        flywheelIndices: [0, 1],
        name: "2brl",
        market: "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba",
      },
      {
        strategy: "DotDotLpERC4626",
        underlying: assets.find((a) => a.symbol === assetSymbols.val3EPS)!.underlying,
        otherParams: [
          "", // _dddFlywheel // TODO
          "", // _epxFlywheel // TODO
          "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
          "0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C", // _rewardsDestination
          abicoder.encode(
            ["address[]"],
            [["0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", "0x84c97300a190676a19D1E13115629A11f8482Bd1"]]
          ), // _rewardTokens
        ],
        flywheelIndices: [0, 1],
        name: "val3EPS",
        market: "0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C",
      },
      {
        // 0x
        strategy: "DotDotLpERC4626",
        underlying: assets.find((a) => a.symbol === assetSymbols.valdai3EPS)!.underlying,
        otherParams: [
          "", // _dddFlywheel // TODO
          "", // _epxFlywheel // TODO
          "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
          "0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248", // _rewardsDestination
          abicoder.encode(
            ["address[]"],
            [["0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", "0x84c97300a190676a19D1E13115629A11f8482Bd1"]]
          ), // _rewardTokens
        ],
        flywheelIndices: [0, 1],
        name: "valdai3EPS",
        market: "0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248",
      },
      {
        strategy: "DotDotLpERC4626",
        underlying: assets.find((a) => a.symbol === assetSymbols["3EPS"])!.underlying,
        otherParams: [
          "", // _dddFlywheel // TODO
          "", // _epxFlywheel // TODO
          "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
          "0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1", // _rewardsDestination
          abicoder.encode(
            ["address[]"],
            [["0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", "0x84c97300a190676a19D1E13115629A11f8482Bd1"]]
          ), // _rewardTokens
        ],
        flywheelIndices: [0, 1],
        name: "3EPS",
        market: "0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1",
      },
    ];
  } else if (chainid == "137") {
    return [
      {
        strategy: "BeefyERC4626",
        market: "0x9b5D86F4e7A45f4b458A2B673B4A3b43D15428A7",
        name: "Beefy agEUR-jEUR Vault",
        underlying: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
        otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0xCC7eab2605972128752396241e46C281e0405a27",
        name: "Beefy jEUR-PAR Vault",
        underlying: "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
        otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0x1792046890b99ae36756Fd00f135dc5F80D41dfA",
        name: "Beefy jJPY-JPYC Vault",
        underlying: "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc",
        otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0x17A6922ADE40e8aE783b0f6b8931Faeca4a5A264",
        name: "Beefy jCAD-CADC Vault",
        underlying: "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
        otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0x41EDdba1e19fe301A067b2726DF5a3332DD02D6A",
        name: "Beefy jSGD-XSGD Vault",
        underlying: "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
        otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0xB3eAb218a7e3A68Dc5020fC1c0F7f0e3214a8bAE",
        name: "Beefy jEUR-EURt Vault",
        underlying: "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1",
        otherParams: ["0x26B7d2fe697e932907175A3920B5dC2C2e2440A4", "10"],
      },
      {
        strategy: "BeefyERC4626",
        market: "0x7AB807F3FBeca9eb22a1A7a490bdC353D85DED41",
        name: "Beefy jNZD-NZDS Vault",
        underlying: "0x976A750168801F58E8AEdbCfF9328138D544cc09",
        otherParams: ["0x6720C2b7fd7dE1CAD3242dd3E8a86d033D4ed3f9", "10"],
      },
      {
        strategy: "ArrakisERC4626",
        market: "0xa5A14c3814d358230a56e8f011B8fc97A508E890",
        name: "Arrakis PAR-USDC Vault",
        underlying: "",
        otherParams: [
          "", // _flywheel // TODO
          "0x528330fF7c358FE1bAe348D23849CCed8edA5917", // IGuniPool _pool
          "0xa5A14c3814d358230a56e8f011B8fc97A508E890", // _rewardsDestination
          abicoder.encode(["address[]"], [["0xADAC33f543267c4D59a8c299cF804c303BC3e4aC"]]), // _rewardTokens
        ],
      },
    ];
  }
}

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
      console.log(`market ${marketAddress} is probably not a plugin market`);
    }
  });
