import { task, types } from "hardhat/config";

export default task("oracle:set-price", "Set price of token")
  .addOptionalParam("address", "Token address for which to set the price", undefined, types.string)
  .addParam("price", "Price to set in the SPO for the token")
  .setAction(async ({ address: _address, price: _price }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);
    const mpo = sdk.createMasterPriceOracle(deployer);

    const underlyingOracle = await ethers.getContractAt(
      "SimplePriceOracle",
      await mpo.callStatic.oracles(_address),
      deployer
    );
    const tx = await underlyingOracle.setDirectPrice(_address, ethers.utils.parseEther(_price));
    await tx.wait();
    console.log(`Set price of ${_address} to ${_price}`);
  });
