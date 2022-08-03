import { task, types } from "hardhat/config";

export default task("oracle:set-price", "Set price of token")
  .addOptionalParam("token", "Token for which to set the price", undefined, types.string)
  .addOptionalParam("address", "Token address for which to set the price", undefined, types.string)
  .addParam("price", "Address to which the minted tokens should be sent to")
  .setAction(async ({ token: _token, address: _address, price: _price }, { getNamedAccounts, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    // @ts-ignore
    const oracleModule = await import("../../tests/utils/oracle");

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
