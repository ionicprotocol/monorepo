import { task, types } from "hardhat/config";

task("oracle:get-price", "Get price of token")
  .addOptionalParam("address", "Token address for which to get the price", undefined, types.string)
  .addOptionalParam("ctoken", "CToken address for which to get the price", undefined, types.string)
  .setAction(async ({ ctoken: _ctoken, address: _address }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);

    const mpo = sdk.createMasterPriceOracle(deployer);

    console.log("oracle: ", mpo.address);
    if (_address) {
      console.log("underlying oracle address: ", await mpo.callStatic.oracles(_address));
      const tokenPriceMPO = await mpo.price(_address);
      console.log(`mpo.price(address): ${tokenPriceMPO.toString()}, i.e.: ${ethers.utils.formatEther(tokenPriceMPO)}`);
    }
    if (_ctoken) {
      const tokenPriceMPO = await mpo.getUnderlyingPrice(_ctoken);
      console.log(
        `mpo.getUnderlyingPrice(cToken): ${tokenPriceMPO.toString()}, i.e.: ${ethers.utils.formatEther(tokenPriceMPO)}`
      );
    }
  });
