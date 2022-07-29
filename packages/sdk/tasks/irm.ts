import { task, types } from "hardhat/config";

export default task("irm:set", "Set new IRM to ctoken")
  .addOptionalParam("ctoken", "cToken for which to set the price", undefined, types.string)
  .addParam("irm", "IRM to use", "JumpRateModel", types.string)
  .setAction(async ({ ctoken: _ctoken, irm: _irm }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const cToken = new ethers.Contract(_ctoken, sdk.chainDeployment.CErc20Delegate.abi, deployer);
    // const interestRateModel = await ethers.getContractAt(_irm, await sdk.irms[_irm].address, deployer);

    const tx = await cToken._setInterestRateModel(sdk.irms[_irm].address);
    await tx.wait();
    console.log(`Set IRM of ${await cToken.callStatic.underlying()} to ${_irm}`);
  });
