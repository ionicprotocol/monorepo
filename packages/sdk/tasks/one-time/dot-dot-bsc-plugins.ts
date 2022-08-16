import { bsc } from "@midas-capital/chains";
import { assetSymbols } from "@midas-capital/types";
import { task, types } from "hardhat/config";

const COMPTROLLER = "0x35F3a59389Dc3174A98610727C2e349E275Dc909";
const dddFlywheelAddress = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";
const epxFlywheelAddress = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
const lpDepositor = "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af";
const dddAddress = "0x84c97300a190676a19D1E13115629A11f8482Bd1";
const epxAddress = "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71";
const bscCErc20DelegateImplementation = "0x1bE825C12608369f28aA5C894a87de76857eAf9b";

const UNDERLYINGS = {
  [assetSymbols.valdai3EPS]: bsc.assets.find((a) => a.symbol === assetSymbols.valdai3EPS)!.underlying,
  [assetSymbols.val3EPS]: bsc.assets.find((a) => a.symbol === assetSymbols.val3EPS)!.underlying,
  [assetSymbols["3EPS"]]: bsc.assets.find((a) => a.symbol === assetSymbols["3EPS"])!.underlying,
};

const DETAILS = [
  {
    strategyName: assetSymbols["3EPS"],
    underlying: UNDERLYINGS[assetSymbols["3EPS"]],
    deployedPlugin: "0xcc1602fBeceb5C4C53DA29B60342822C753652E8",
  },
  {
    strategyName: assetSymbols.val3EPS,
    underlying: UNDERLYINGS[assetSymbols.val3EPS],
    deployedPlugin: "0x9dB349BbfF9E177dB4bd3134ff93876688b77835",
  },
  {
    strategyName: assetSymbols.valdai3EPS,
    underlying: UNDERLYINGS.valdai3EPS,
    deployedPlugin: "0xBb6729e250Ff6b1BB2917bC65817731E98157B1F",
  },
];

// STEP 1: deploy plugins and note addresses down
task("dotdot:bsc:deploy-plugins", "deploy DotDot plugins for DotDot pool on BSC")
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

      const deployArgs = [
        detail.underlying,
        dddFlywheelAddress,
        epxFlywheelAddress,
        lpDepositor,
        marketAddress,
        [dddAddress, epxAddress],
      ];

      const pluginDeployment = await hre.deployments.deploy(
        "DotDotLpERC4626_" + detail.strategyName + "_" + COMPTROLLER,
        {
          contract: "DotDotLpERC4626",
          from: signer.address,
          args: deployArgs,
          log: true,
        }
      );
      console.log(`Plugin deployed successfully: ${pluginDeployment.address}`);
    }
  });

// STEP 2: add plugin address to the DETAILs, and whitelist them
task("dotdot:bsc:whitelist-plugins", "whitelist dotdot plugins for DotDot pool on bsc")
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

// STEP 3: upgrade markets to the new implementation
task("dotdot:bsc:upgrade-implementations", "upgrade all markets of the polygon pool to handle plugins")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      console.log(`upgrading market for: ${detail.strategyName} ...`);

      await hre.run("market:upgrade", {
        comptroller: COMPTROLLER,
        underlying: detail.underlying, // FYI it's expecting the underlying here
        implementationAddress: bscCErc20DelegateImplementation,
        pluginAddress: detail.deployedPlugin,
        signer: taskArgs.signer,
      });
    }
  });

task("dotdot:bsc:set-flywheels", "set plugin for each market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const dddFlywheel = sdk.createFuseFlywheelCore(dddFlywheelAddress);
    const epxFlywheel = sdk.createFuseFlywheelCore(epxFlywheelAddress);

    for (const detail of DETAILS) {
      const marketAddress = await sdk
        .createComptroller(COMPTROLLER, signer)
        .callStatic.cTokensByUnderlying(detail.underlying);
      const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);

      // Step 4: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
      const dddRewards = await dddFlywheel.callStatic.flywheelRewards();
      console.log({ dddRewards });
      const approveDDDTx = await cToken["approve(address,address)"](dddAddress, dddRewards);
      const approveReceiptDDD = await approveDDDTx.wait();
      console.log("ctoken approved DDD rewards for DDD", approveReceiptDDD.status, approveDDDTx.hash);

      const epxRewards = await epxFlywheel.callStatic.flywheelRewards();
      console.log({ epxRewards });
      const approveEPXTx = await cToken["approve(address,address)"](epxAddress, epxRewards);
      const approveReceiptEPX = await approveEPXTx.wait();
      console.log("ctoken approved EPX rewards for EPX", approveReceiptEPX.status, approveEPXTx.hash);

      // Step 5: enable marketAddress on flywheels
      try {
        const dddAddTx = await dddFlywheel.addStrategyForRewards(marketAddress);
        const resultDDD = await dddAddTx.wait(2);
        console.log("enabled market on dddFWC");
        const epxAddTx = await epxFlywheel.addStrategyForRewards(marketAddress);
        const resultEPX = await epxAddTx.wait(2);
        console.log("enabled market on epxFWC");
      } catch (e) {
        console.log(marketAddress, "already added");
        console.log(e);
      }
      try {
        //   Step 6: add Flywheels to market
        await sdk.addFlywheelCoreToComptroller(dddFlywheelAddress, COMPTROLLER, { from: signer.address });

        console.log("dddFWC added to comptroller");
        await sdk.addFlywheelCoreToComptroller(epxFlywheelAddress, COMPTROLLER, { from: signer.address });
        console.log("epxFWC added to comptroller");
      } catch (e) {
        console.log("already added");
        console.log(e);
      }
    }
  });

// task("dotdot:bsc:set-plugins", "set plugin for each market")
//   .addParam("signer", "Named account to use for tx", "deployer", types.string)
//   .setAction(async (taskArgs, hre) => {
//     for (const detail of DETAILS) {
//       await hre.run("market:set-plugin", {
//         comptrollerAddress: COMPTROLLER,
//         underlying: detail.underlying, // FYI it's expecting the underlying here
//         pluginAddress: detail.deployedPlugin,
//         signer: taskArgs.signer,
//       });
//     }
//   });
