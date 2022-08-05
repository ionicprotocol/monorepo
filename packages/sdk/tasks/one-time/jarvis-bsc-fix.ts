/**
 * WARNING
 * THIS FILE IS JUST KEPT FOR FUTURE REFERENCE
 * FOR DEPLOYING MARKETS WITH DYNAMIC REWARDS
 */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";

task("jarvis-fix", "deploy new strategy for jarvis 2brl pool")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    let signer: SignerWithAddress;
    try {
      signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    } catch {
      throw `Invalid 'signer': ${taskArgs.signer}`;
    }

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const jarvisComptroller = "0x31d76A64Bc8BbEffb601fac5884372DEF910F044";
    const dddAddress = "0x84c97300a190676a19D1E13115629A11f8482Bd1";
    const epxAddress = "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71";
    const twobrl = "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9";
    const dddFlywheelAddress = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";
    const epxFlywheelAddress = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
    const dddFlywheel = sdk.createFuseFlywheelCore(dddFlywheelAddress);
    const epxFlywheel = sdk.createFuseFlywheelCore(epxFlywheelAddress);
    const marketAddress = await sdk
      .createComptroller("0x31d76A64Bc8BbEffb601fac5884372DEF910F044", signer)
      .callStatic.cTokensByUnderlying(twobrl);
    const cToken = await sdk.createCErc20PluginRewardsDelegate(marketAddress);
    console.log({ marketAddress });

    // Step 1: Deploy Fresh Strategy with marketAddress=rewardsDestination
    const strategyArgs = [
      "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9", //_asset,
      dddFlywheelAddress, //_dddFlywheel,
      epxFlywheelAddress, //_epxFlywheel,
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", //_lpDepositor,
      marketAddress, //_rewardsDestination,
      ["0x84c97300a190676a19D1E13115629A11f8482Bd1", "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71"], //_rewardTokens
    ];
    console.log({ strategyArgs });

    const pluginDeployment = await hre.deployments.deploy("DotDotLpERC4626_" + marketAddress, {
      contract: "DotDotLpERC4626",
      from: signer.address,
      args: strategyArgs,
      log: true,
    });
    console.log(`Plugin deployed successfully: ${pluginDeployment.address}`);

    // // Step 2: update market, use same implementation
    // const currentImplementation = await cToken.callStatic.implementation();
    // console.log({ currentImplementation });
    // const abiCoder = new hre.ethers.utils.AbiCoder();
    // const implementationData = abiCoder.encode(["address"], [pluginDeployment.address]);
    // const upgradeTx = await cToken._setImplementationSafe(
    //   "0xf698b0306342d197D1A55aE643F9aD26250b4624",
    //   false,
    //   implementationData
    // );
    // const upgradeResult = await upgradeTx.wait(2);
    // console.log("changed plugin successfully");

    // Step 3: Approve fwc Rewards to get rewardTokens from it (!IMPORTANT to use "approve(address,address)", it has two approve functions)
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

    // Step 4: enable marketAddress on flywheels
    // const dddAddTx = await dddFlywheel.addStrategyForRewards(marketAddress);
    // const resultDDD = await dddAddTx.wait(2);
    // console.log("enabled market on dddFWC");
    // const epxAddTx = await epxFlywheel.addStrategyForRewards(marketAddress);
    // const resultEPX = await epxAddTx.wait(2);
    // console.log("enabled market on epxFWC");

    // Step 5: add Flywheels to market
    // await sdk.addFlywheelCoreToComptroller(dddFlywheelAddress, jarvisComptroller, { from: signer.address });
    // console.log("dddFWC added to comptroller");
    // await sdk.addFlywheelCoreToComptroller(epxFlywheelAddress, jarvisComptroller, { from: signer.address });
    // console.log("epxFWC added to comptroller");

    console.log("DONE");
  });

task("deploy-jarvis-2fiat-plugins", "deploy beefy plugins for jarvis 2fiat")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("poolAddress", "Address for the pool", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const pluginDetails = [
      {
        strategyName: "AGEURJEUR",
        underlying: "0x2ffbce9099cbed86984286a54e5932414af4b717",
        otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "10"],
      },
      {
        strategyName: "JEURPAR",
        underlying: "0x0f110c55efe62c16d553a3d3464b77e1853d0e97",
        otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "10"],
      },
      {
        strategyName: "JJPYJPYC",
        underlying: "0xaa91cdd7abb47f821cf07a2d38cc8668deaf1bdc",
        otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "10"],
      },
      {
        strategyName: "JCADCADC",
        underlying: "0xa69b0d5c0c401bba2d5162138613b5e38584f63f",
        otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "10"],
      },
      {
        strategyName: "JSGDXSGD",
        underlying: "0xef75e9c7097842acc5d0869e1db4e5fddf4bfdda",
        otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "10"],
      },
    ];

    for (const plugin of pluginDetails) {
      await hre.run("plugin:deploy", {
        contractName: "BeefyERC4626",
        deploymentName: `BeefyERC4626_${plugin.strategyName}`,
        underlying: plugin.underlying,
        creator: taskArgs.signer,
        otherParams: plugin.otherParams.join(","),
      });
    }
  });
