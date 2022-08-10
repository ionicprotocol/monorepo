import { task, types } from "hardhat/config";

export default task("oracle:set-price", "Set price of token")
  .addOptionalParam("token", "Token for which to set the price", undefined, types.string)
  .addOptionalParam("address", "Token address for which to set the price", undefined, types.string)
  .addParam("price", "Price to set in the SPO for the token")
  .setAction(async ({ token: _token, address: _address, price: _price }, { getNamedAccounts, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    // @ts-ignore
    const oracleModule = await import("../../tests/utils/oracle");

    // {
    //   // Jarvis jFIAT pool
    //   // @ts-ignore
    //   const midasSdkModule = await import("../../tests/utils/midasSdk");
    //   const sdk = await midasSdkModule.getOrCreateMidas();
    //
    //   const comptroller = sdk.getComptrollerInstance("0x31d76A64Bc8BbEffb601fac5884372DEF910F044", { from: deployer.address });
    //   const currentOracle = await comptroller.callStatic.oracle();
    //   if (currentOracle != "0xC3d88756d325491FD10dC19A38AB0558778902F4") {
    //     console.log(`current oracle ${currentOracle} is different than 0xC3d88756d325491FD10dC19A38AB0558778902F4`);
    //     const tx =await comptroller._setPriceOracle("0xC3d88756d325491FD10dC19A38AB0558778902F4");
    //     await tx.wait();
    //     console.log(`oracle changed with tx ${tx.hash}`);
    //   }
    // }

    const [tokenAddress, oracle] = await oracleModule.setUpOracleWithToken(_token, _address, ethers, getNamedAccounts);
    const underlyingOracle = await ethers.getContractAt(
      "SimplePriceOracle",
      await oracle.callStatic.oracles(tokenAddress),
      deployer
    );
    const tx = await underlyingOracle.setDirectPrice(tokenAddress, ethers.utils.parseEther(_price));
    await tx.wait();
    console.log(`Set price of ${_token ? _token : _address} to ${_price}`);
  });
