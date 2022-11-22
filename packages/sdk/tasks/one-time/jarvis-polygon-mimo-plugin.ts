import { polygon } from "@midas-capital/chains";
import { assetSymbols } from "@midas-capital/types";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { Unitroller } from "../../typechain/Unitroller";

const COMPTROLLER = "0xF1ABd146B4620D2AE67F34EA39532367F73bbbd2";
const mimoFlywheelAddress = "0x6c44d119536CE433dC8bed943B7A1BC7EFCD56F4";
const vault = "0x2BC39d179FAfC32B7796DDA3b936e491C87D245b";
const jrtMimoSep22Address = "0xAFC780bb79E308990c7387AB8338160bA8071B67";

const UNDERLYINGS = {
  [assetSymbols["JEUR-PAR"]]: polygon.assets.find((a) => a.symbol === assetSymbols["JEUR-PAR"])!.underlying,
};

const DETAILS = [
  {
    strategyName: assetSymbols["JEUR-PAR"],
    underlying: UNDERLYINGS[assetSymbols["JEUR-PAR"]],
    deployedPlugin: "0x57eB88582696581B95A46D46c52F8c33d5ef7373",
  },
];

// STEP 1: deploy plugins and note addresses down
task("jarvis:polygon:deploy-plugins", "deploy Jarvis plugins for Jarvis pool on POLYGON")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    for (const detail of DETAILS) {
      console.log(detail);

      const marketAddress = await sdk
        .createComptroller(COMPTROLLER, signer)
        .callStatic.cTokensByUnderlying(detail.underlying);
      const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);
      console.log(await cToken.callStatic.implementation());

      console.log({ marketAddress });

      const deployArgs = [detail.underlying, mimoFlywheelAddress, vault, 0, marketAddress, [jrtMimoSep22Address]];

      const pluginDeployment = await hre.deployments.deploy(
        "JarvisERC4626_" + detail.strategyName + "_" + COMPTROLLER,
        {
          contract: "JarvisERC4626",
          from: signer.address,
          args: deployArgs,
          log: true,
        }
      );
      console.log(`Plugin deployed successfully: ${pluginDeployment.address}`);
    }
  });

// STEP 2: add plugin address to the DETAILs, and whitelist them
task("jarvis:polygon:whitelist-plugins", "whitelist jarvis plugins for Jarvis pool on polygon")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      console.log(`whitelisting plugin for: ${detail.strategyName} ...`);

      // setting the whitelist for the first time for this plugin
      await hre.run("plugin:whitelist", {
        oldImplementation: detail.deployedPlugin,
        newImplementation: detail.deployedPlugin,
        admin: taskArgs.signer,
      });
    }
  });

// STEP 2.5: set the whitelist for the upgrade from CErc20Delegate to CErc20PluginRewardsDelegate
// run:
// yarn workspace @midas-capital/sdk hardhat market:updatewhitelist --old-plugin-rewards-delegate <current market CErc20 implementation> --network polygon

// STEP 3: upgrade markets to the new implementation
task("jarvis:polygon:upgrade-implementations", "upgrade all markets of the polygon pool to handle plugins")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      console.log(`upgrading market for: ${detail.strategyName} ...`);
      // @ts-ignore
      const midasSdkModule = await import("../../tests/utils/midasSdk");
      const sdk = await midasSdkModule.getOrCreateMidas();

      await hre.run("market:upgrade", {
        comptroller: COMPTROLLER,
        underlying: detail.underlying, // FYI it's expecting the underlying here
        implementationAddress: sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
        pluginAddress: detail.deployedPlugin,
        signer: taskArgs.signer,
      });
    }
  });

task("jarvis:polygon:set-flywheels", "set plugin for each market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const mimoFlywheel = sdk.createMidasFlywheel(mimoFlywheelAddress);

    for (const detail of DETAILS) {
      const marketAddress = await sdk
        .createComptroller(COMPTROLLER, signer)
        .callStatic.cTokensByUnderlying(detail.underlying);
      const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);

      // Step 4: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
      const mimoRewards = await mimoFlywheel.callStatic.flywheelRewards();
      console.log({ mimoRewards });
      const approveMIMOTx = await cToken["approve(address,address)"](jrtMimoSep22Address, mimoRewards);
      const approveReceiptMIMO = await approveMIMOTx.wait();
      console.log("ctoken approved MIMO rewards for MIMO", approveReceiptMIMO.status, approveMIMOTx.hash);

      // Step 5: enable marketAddress on flywheels
      try {
        const mimoAddTx = await mimoFlywheel.addStrategyForRewards(marketAddress);
        const resultMIMO = await mimoAddTx.wait(2);
        console.log("enabled market on mimoFWC");
      } catch (e) {
        console.log(marketAddress, "already added");
        console.log(e);
      }
      try {
        //   Step 6: add Flywheels to market
        await sdk.addFlywheelCoreToComptroller(mimoFlywheelAddress, COMPTROLLER);

        console.log("mimoFWC added to comptroller");
      } catch (e) {
        console.log("already added");
        console.log(e);
      }
    }
  });

task("fix:jarvis:epxddd", "A one-time task to fix the old EPX and DDD flywheels").setAction(
  async ({}, { run, ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const epxFlywheel = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
    const dddFlywheel = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";
    const jarvisFiatPool = "0x31d76A64Bc8BbEffb601fac5884372DEF910F044";

    // // should be done already at deploy
    // await run("comptroller:implementation:whitelist",
    //   {
    //     oldImplementation: "",
    //     newImplementation: ""
    //   });

    const latestComptrollerImpl = (await ethers.getContract("Comptroller", deployer)) as Comptroller;

    const unitroller = (await ethers.getContractAt("Unitroller", jarvisFiatPool, deployer)) as Unitroller;

    let tx = await unitroller._setPendingImplementation(latestComptrollerImpl.address);
    await tx.wait();
    console.log(`set the pending implementation with ${tx.hash}`);

    tx = await latestComptrollerImpl._become(unitroller.address);
    await tx.wait();
    console.log(`became the implementation with ${tx.hash}`);

    const asComptroller = (await ethers.getContractAt("Comptroller", jarvisFiatPool, deployer)) as Comptroller;

    tx = await asComptroller.addNonAccruingFlywheel(epxFlywheel);
    await tx.wait();
    console.log(`moved the old EPX flywheel to the non-accruing with ${tx.hash}`);
    tx = await asComptroller.addNonAccruingFlywheel(dddFlywheel);
    await tx.wait();
    console.log(`moved the old DDD flywheel to the non-accruing with ${tx.hash}`);
  }
);
