import { task, types } from "hardhat/config";

export default task("irm:set", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const ctokens = _ctokens.split(",");

    for (const cTokenAddress of ctokens) {
      const cToken = sdk.createCTokenWithExtensions(cTokenAddress, deployer);
      const tx = await cToken._setInterestRateModel(_irmAddress);
      await tx.wait();
      console.log(`Set IRM of ${await cToken.callStatic.underlying()} to ${_irmAddress}`);
    }
  });
