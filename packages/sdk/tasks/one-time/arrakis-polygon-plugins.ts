import { polygon } from "@midas-capital/chains";
import { assetSymbols } from "@midas-capital/types";
import { task, types } from "hardhat/config";

const COMPTROLLER = "0xF1ABd146B4620D2AE67F34EA39532367F73bbbd2";
const mimoFlywheelAddress = "0x7D28F081711f43Ad98ba0cB7C65af6268f27fdA7";
const guniPool = "0x528330fF7c358FE1bAe348D23849CCed8edA5917";
const mimoAddress = "0xADAC33f543267c4D59a8c299cF804c303BC3e4aC";

const UNDERLYINGS = {
  [assetSymbols.arrakis_USDC_PAR_005]: polygon.assets.find((a) => a.symbol === assetSymbols.arrakis_USDC_PAR_005)!
    .underlying,
};

const DETAILS = [
  {
    strategyName: assetSymbols.arrakis_USDC_PAR_005,
    underlying: UNDERLYINGS[assetSymbols.arrakis_USDC_PAR_005],
    deployedPlugin: "0x00522B12FB53803041AF948eCfB5CC81477CEB04",
  },
];

// STEP 1: deploy plugins and note addresses down
task("arrakis:polygon:deploy-plugins", "deploy Arrakis plugins for Arrakis pool on POLYGON")
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

      const deployArgs = [detail.underlying, mimoFlywheelAddress, guniPool, marketAddress, [mimoAddress]];

      const pluginDeployment = await hre.deployments.deploy(
        "ArrakisERC4626_" + detail.strategyName + "_" + COMPTROLLER,
        {
          contract: "ArrakisERC4626",
          from: signer.address,
          args: deployArgs,
          log: true,
        }
      );
      console.log(`Plugin deployed successfully: ${pluginDeployment.address}`);
    }
  });

// STEP 2: add plugin address to the DETAILs, and whitelist them
task("arrakis:polygon:whitelist-plugins", "whitelist arrakis plugins for Arrakis pool on polygon")
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
task("arrakis:polygon:upgrade-implementations", "upgrade all markets of the polygon pool to handle plugins")
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

task("arrakis:polygon:set-flywheels", "set plugin for each market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const mimoFlywheel = sdk.createFuseFlywheelCore(mimoFlywheelAddress);

    for (const detail of DETAILS) {
      const marketAddress = await sdk
        .createComptroller(COMPTROLLER, signer)
        .callStatic.cTokensByUnderlying(detail.underlying);
      const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);

      // Step 4: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
      const mimoRewards = await mimoFlywheel.callStatic.flywheelRewards();
      console.log({ mimoRewards });
      const approveMIMOTx = await cToken["approve(address,address)"](mimoAddress, mimoRewards);
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
