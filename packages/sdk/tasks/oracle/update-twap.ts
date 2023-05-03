import { task, types } from "hardhat/config";

task("oracle:update-twap", "Call update on twap oracle to update the last price observation")
  .addParam("pair", "pair address for which to run the update", undefined, types.string)
  .setAction(async ({ pair: _pair }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);

    const uniswapTwapRoot = await ethers.getContractAt(
      "UniswapTwapPriceOracleV2Root",
      sdk.chainDeployment.UniswapTwapPriceOracleV2Root.address,
      deployer
    );

    const tx = await uniswapTwapRoot["update(address)"](_pair);
    await tx.wait();
  });

task("oracle:remove-twap-pair", "Call update on twap oracle to update the last price observation")
  .addParam("pairIndex", "pair address for which to run the update", undefined, types.string)
  .setAction(async ({ pairIndex: _pairIndex }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);

    const uniswapTwapRoot = await ethers.getContractAt(
      "UniswapTwapPriceOracleV2Resolver",
      sdk.chainDeployment.UniswapTwapPriceOracleV2Resolver.address,
      deployer
    );
    const existingPairs = await uniswapTwapRoot.callStatic.getPairs();
    console.log("Existing Pairs", existingPairs);

    const tx = await uniswapTwapRoot.removeFromPairs(_pairIndex);
    await tx.wait();
    console.log("Updated Pairs", await uniswapTwapRoot.callStatic.getPairs());
  });
