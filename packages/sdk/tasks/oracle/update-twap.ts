import { task, types } from "hardhat/config";

task("oracle:update-twap", "Call update on twap oracle to update the last price observation")
  .addParam("pair", "pair address for which to run the update", undefined, types.string)
  .setAction(async ({ pair: _pair }, { run, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const uniswapTwapRoot = await ethers.getContractAt(
      "UniswapTwapPriceOracleV2Root",
      sdk.chainDeployment.UniswapTwapPriceOracleV2Root.address,
      deployer
    );

    const tx = await uniswapTwapRoot["update(address)"](_pair);
    await tx.wait();
  });
