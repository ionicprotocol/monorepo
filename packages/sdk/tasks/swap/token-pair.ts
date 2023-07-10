import { task, types } from "hardhat/config";

task("swap:get-token-pair", "Get token pair address")
  .addOptionalParam("token0", "token0 address", undefined, types.string)
  .addParam("token1", "token1 address", undefined, types.string)
  .addOptionalParam("account", "Account with which to trade", "deployer", types.string)
  .setAction(async ({ token0: _token0, token1: _token1, account: _account }, { ethers }) => {
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();
    const account = await ethers.getNamedSigner(_account);

    if (!_token0) {
      _token0 = sdk.chainSpecificAddresses.W_TOKEN;
    }
    const uniFactory = new ethers.Contract(
      sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
      ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
      account
    );
    const pair = await uniFactory.callStatic.getPair(_token0, _token1);
    console.log(`Token pair: ${pair}`);
    return pair;
  });
