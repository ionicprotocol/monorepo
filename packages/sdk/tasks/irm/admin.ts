import { task, types } from "hardhat/config";

export default task("irm:set", "Set new IRM to ctoken")
  .addParam("ctoken", "cToken for which to set the IRM", undefined, types.string)
  .addParam("irmAddress", "Irm address to use ", undefined, types.string)
  .setAction(async ({ ctoken: _ctoken, irmAddress: _irmAddress }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const cToken = new ethers.Contract(_ctoken, sdk.chainDeployment.CErc20Delegate.abi, deployer);
    // const interestRateModel = await ethers.getContractAt(_irm, await sdk.irms[_irm].address, deployer);

    const tx = await cToken._setInterestRateModel(_irmAddress);
    await tx.wait();
    console.log(`Set IRM of ${await cToken.callStatic.underlying()} to ${_irmAddress}`);
  });
