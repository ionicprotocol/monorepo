import { task, types } from "hardhat/config";

export default task("oracle:set-price", "Set price of token")
  .addOptionalParam("token", "Token for which to set the price", undefined, types.string)
  .addOptionalParam("address", "Token address for which to set the price", undefined, types.string)
  .addParam("price", "Address to which the minted tokens should be sent to")
  .setAction(async ({ token: _token, address: _address, price: _price }, { getNamedAccounts, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    // @ts-ignore
    const oracleModule = await import("../tests/utils/oracle");

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

task("oracle:get-price", "Get price of token")
  .addOptionalParam("token", "Token symbol for which to get the price", undefined, types.string)
  .addOptionalParam("address", "Token address for which to get the price", undefined, types.string)
  .setAction(async ({ token: _token, address: _address, price: _price }, { getNamedAccounts, ethers }) => {
    // @ts-ignore
    const oracleModule = await import("../tests/utils/oracle");
    const [tokenAddress, oracle] = await oracleModule.setUpOracleWithToken(_token, _address, ethers, getNamedAccounts);
    const tokenPriceMPO = await oracle.price(tokenAddress);
    console.log("tokenPriceMPO: ", tokenPriceMPO.toString());
    console.log(`Price ${_token ? _token : _address}: ${ethers.utils.formatEther(tokenPriceMPO)}`);
    return tokenPriceMPO;
  });

task("oracle:add-tokens", "Initialize MasterPriceOracle with underlying oracle for assets")
  .addOptionalParam("underlyings", "Token for which to set the price", undefined, types.string)
  .addOptionalParam("oracles", "Token address for which to set the price", undefined, types.string)
  .setAction(async ({ underlyings: _underlyings, oracles: _oracles }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const mpo = await ethers.getContractAt("MasterPriceOracle", sdk.oracles.MasterPriceOracle.address, deployer);
    const underlyingTokens = _underlyings.split(",");

    let underlyingOracles: Array<string>;

    if (!_oracles) {
      // by default, get uniswap's twap oracle address
      const uniOracleFactory = await ethers.getContractAt(
        "UniswapTwapPriceOracleV2Factory",
        sdk.chainDeployment.UniswapTwapPriceOracleV2Factory.address,
        deployer
      );
      const underlyingOracle = await uniOracleFactory.callStatic.oracles(
        sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
        sdk.chainSpecificAddresses.W_TOKEN
      );
      underlyingOracles = Array(underlyingTokens.length).fill(underlyingOracle);
    } else {
      underlyingOracles = _oracles.split(",");
      if (underlyingOracles.length === 1) {
        underlyingOracles = Array(underlyingTokens.length).fill(underlyingOracles[0]);
      }
    }
    const tx = await mpo.add(underlyingTokens, underlyingOracles);
    await tx.wait();
    console.log(`Master Price Oracle updated for tokens ${underlyingTokens.join(", ")}`);
  });

task("oracle:update-twap", "Call update on twap oracle to update the last price observation")
  .addParam("pair", "pair address for which to run the update", undefined, types.string)
  .setAction(async ({ pair: _pair }, { run, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const uniswapTwapRoot = await ethers.getContractAt(
      "UniswapTwapPriceOracleV2Root",
      sdk.chainDeployment.UniswapTwapPriceOracleV2Root.address,
      deployer
    );

    const tx = await uniswapTwapRoot["update(address)"](_pair);
    await tx.wait();
  });
