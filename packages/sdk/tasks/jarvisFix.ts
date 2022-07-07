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
    const twobrl = "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9";
    const dddFlywheelAddress = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";
    const epxFlywheelAddress = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
    const marketAddress = await sdk
      .createComptroller("0x31d76A64Bc8BbEffb601fac5884372DEF910F044", signer)
      .callStatic.cTokensByUnderlying(twobrl);

    // Step 1: Deploy Fresh Strategy with marketAddress=rewardsDestination
    console.log({ marketAddress });

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

    // Step 2: update plugin, use same implementation
    const cToken = await sdk.createCToken(marketAddress);
    const currentImplementation = await cToken.callStatic.implementation();
    const abiCoder = new hre.ethers.utils.AbiCoder();
    const implementationData = abiCoder.encode(["address"], [pluginDeployment.address]);
    const upgradeTx = await cToken._setImplementationSafe(currentImplementation, false, implementationData);
    const upgradeResult = upgradeTx.wait(2);
    console.log("changed plugin successfully", upgradeResult);

    // Step 3: enable marketAddress on flywheels
    const dddFlywheel = sdk.createFuseFlywheelCore(dddFlywheelAddress);
    const epxFlywheel = sdk.createFuseFlywheelCore(epxFlywheelAddress);

    const dddAddTx = await dddFlywheel.addStrategyForRewards(marketAddress);
    const resultDDD = await dddAddTx.wait(2);
    console.log("enabled market on dddFWC", resultDDD);
    const epxAddTx = await epxFlywheel.addStrategyForRewards(marketAddress);
    const resultEPX = await epxAddTx.wait(2);
    console.log("enabled market on epxFWC", resultEPX);

    // Step 4: add Flywheels to market
    await sdk.addFlywheelCoreToComptroller(dddFlywheelAddress, jarvisComptroller, { from: signer.address });
    console.log("dddFWC added to comptroller");
    await sdk.addFlywheelCoreToComptroller(epxFlywheelAddress, jarvisComptroller, { from: signer.address });
    console.log("epxFWC added to comptroller");
    console.log("DONE");
  });
