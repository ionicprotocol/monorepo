import { task, types } from "hardhat/config";

task("jarvis-fix", "deploy new strategy for jarvis 2brl pool")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    let signer;
    try {
      signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    } catch {
      throw `Invalid 'signer': ${taskArgs.signer}`;
    }

    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

    const twobrl = "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9";
    const market = await sdk
      .createComptroller("0x31d76A64Bc8BbEffb601fac5884372DEF910F044", signer)
      .callStatic.cTokensByUnderlying(twobrl);

    console.log({ market });
    const args = [
      "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9", //_asset,
      "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c", //_dddFlywheel,
      "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4", //_epxFlywheel,
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", //_lpDepositor,
      market, //_rewardsDestination,
      ["0x84c97300a190676a19D1E13115629A11f8482Bd1", "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71"], //_rewardTokens
    ];
    console.log({ args });

    const deploymentTx = await hre.deployments.deploy("DotDotLpERC4626", {
      from: signer.address,
      args: args,
      log: true,
    });
    console.log(deploymentTx);
  });
