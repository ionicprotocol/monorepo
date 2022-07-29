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
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

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
