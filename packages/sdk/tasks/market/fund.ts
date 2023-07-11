import { bsc, polygon } from "@ionicprotocol/chains";
import { assetFilter } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

const underlyingsMapping = {
  [bsc.chainId]: bsc.assets,
  [polygon.chainId]: polygon.assets,
};

task("fund:mint", "deploy dynamic rewards plugin with flywheels")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "Symbols of assets for which to deploy the plugin", undefined, types.string)
  .addParam("amount", "Extra plugin parameters", undefined, types.string)
  .addParam("approve", "Approve tx", false, types.boolean)
  .addParam("enter", "Enter tx", false, types.boolean)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner(taskArgs.signer);
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const underlyings = underlyingsMapping[sdk.chainId];

    // task argument parsing
    const comptroller = taskArgs.comptroller;
    const symbol = taskArgs.symbol;

    const { underlying, decimals } = assetFilter(underlyings, symbol);
    const marketAddress = await sdk.createComptroller(comptroller, signer).callStatic.cTokensByUnderlying(underlying);

    const cToken = sdk.createCErc20PluginRewardsDelegate(marketAddress);
    console.log("cToken: ", cToken.address);

    let tx;
    if (taskArgs.approve) {
      tx = await sdk.approve(cToken.address, underlying);
      console.log("approved tx: ", tx.hash);
    }
    if (taskArgs.enter) {
      tx = await sdk.enterMarkets(cToken.address, comptroller);
      console.log("enter tx: ", tx.hash);
    }
    await sdk.mint(cToken.address, ethers.utils.parseUnits(taskArgs.amount, decimals));
    console.log("mint tx: ", tx.hash);
  });
