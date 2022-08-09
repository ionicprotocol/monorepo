import { task, types } from "hardhat/config";

task("oracle:get-price", "Get price of token")
  .addOptionalParam("token", "Token symbol for which to get the price", undefined, types.string)
  .addOptionalParam("address", "Token address for which to get the price", undefined, types.string)
  .setAction(async ({ token: _token, address: _address, price: _price }, { getNamedAccounts, ethers }) => {
    // @ts-ignore
    const oracleModule = await import("../../tests/utils/oracle");
    const [tokenAddress, oracle] = await oracleModule.setUpOracleWithToken(_token, _address, ethers, getNamedAccounts);
    console.log("oracle: ", oracle.address);
    const tokenPriceMPO = await oracle.price(tokenAddress);
    console.log("price: ", tokenPriceMPO.toString());
    console.log(`Price ${_token ? _token : _address}: ${ethers.utils.formatEther(tokenPriceMPO)}`);
    return tokenPriceMPO;
  });
