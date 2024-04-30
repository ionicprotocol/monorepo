import { chainIdToConfig } from "@ionicprotocol/chains";
import { bsc, polygon, sepolia } from "@ionicprotocol/chains";
import { assetFilter } from "@ionicprotocol/types";
import { task, types } from "hardhat/config";

const underlyingsMapping = {
  [bsc.chainId]: bsc.assets,
  [polygon.chainId]: polygon.assets,
  [sepolia.chainId]: sepolia.assets
};

task("borrow", "Borrow assets")
  .addParam("signer", "Named account to use for transactions", "deployer", types.string)
  .addParam("comptroller", "Address of the Comptroller contract", undefined, types.string)
  .addParam("symbol", "Symbol of the asset for which to deploy the plugin", undefined, types.string)
  .addParam("amount", "Amount to borrow, specified in underlying units", undefined, types.string)
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

    const cToken = sdk.createICErc20PluginRewards(marketAddress);
    console.log("cToken: ", cToken.address);

    const result = await sdk.borrow(cToken.address, ethers.utils.parseUnits(taskArgs.amount, decimals));

    if (result.errorCode) {
      console.error(`Failed to borrow, error code: ${result.errorCode}`);
    } else if (result.tx) {
      console.log(`Borrow transaction sent! Transaction hash: ${result.tx.hash}`);
      await result.tx.wait();
      console.log("Transaction confirmed!");
    }
  });
