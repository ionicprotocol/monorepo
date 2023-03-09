import { task, types } from "hardhat/config";

import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";

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

task("irm:set-non-owner", "Set new IRM to ctoken")
  .addParam("ctokens", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctokens: _ctokens, irmAddress: _irmAddress }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;
    // @ts-ignore
    const sliced = _irmAddress.slice(2);
    const cTokens = _ctokens.split(",");

    for (const cToken of cTokens) {
      // cToken._setInterestRateModel(irmAddress);
      const tx = await fuseFeeDistributor["_callPool(address[],bytes[])"](
        [cToken],
        [`0xf2b3abbd000000000000000000000000${sliced}`]
      );
      await tx.wait();
      console.log(`become with ${tx.hash}`);
    }
  });
