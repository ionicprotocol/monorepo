import { task, types } from "hardhat/config";

export default task("irm:set", "Set new IRM to ctoken")
  .addOptionalParam("ctoken", "cToken for which to set the price", undefined, types.string)
  .addParam("irm", "IRM to use", "JumpRateModel", types.string)
  .setAction(async ({ ctoken: _ctoken, irm: _irm }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const pool = await sdk.fetchFusePoolData("3", undefined);
    console.log(pool.id, pool.name);
    for (const asset of pool.assets) {
      const cToken = new ethers.Contract(asset.cToken, sdk.chainDeployment.CErc20Delegate.abi, deployer);
      const tx = await cToken._setInterestRateModel("0x7a0b2548B74078f2f07ff8B82cb6efdeB780F6eE");
      await tx.wait();
      console.log(`Set IRM of ${await cToken.callStatic.underlying()} to ${_irm}`);
    }

    // const interestRateModel = await ethers.getContractAt(_irm, await sdk.irms[_irm].address, deployer);
  });
