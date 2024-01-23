import { providers } from "ethers";
import { task, types } from "hardhat/config";

export default task("market:set-borrow-cap", "Set borrow cap on market")
  .addParam("admin", "Named account from which to set the borrow caps", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("maxBorrow", "Maximum amount of tokens that can be borrowed", undefined, types.string)
  .setAction(async ({ admin, market, maxBorrow }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);

    const cToken = sdk.createICErc20(market, signer);
    const comptroller = await cToken.callStatic.comptroller();
    const pool = sdk.createComptroller(comptroller, signer);

    const currentBorrowCap = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`Current borrow cap is ${currentBorrowCap}`);

    const newBorrowCap = ethers.BigNumber.from(maxBorrow);
    if (currentBorrowCap.eq(newBorrowCap)) {
      console.log("Borrow cap is already set to this value");
      return;
    }

    const tx: providers.TransactionResponse = await pool._setMarketBorrowCaps([cToken.address], [newBorrowCap]);
    await tx.wait();

    const newSupplyCapSet = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`New supply cap set: ${newSupplyCapSet.toNumber()}`);
  });

task("market:set-borrow-cap-whitelist", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to set the borrow cap whitelist", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("account", "Account to be whitelisted / removed from whitelist", undefined, types.string)
  .addOptionalParam("whitelist", "Set whitelist to true ot false", true, types.boolean)
  .setAction(async ({ admin, market, account, whitelist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);

    const cToken = sdk.createICErc20(market, signer);
    const comptroller = await cToken.callStatic.comptroller();
    const pool = sdk.createComptroller(comptroller, signer);

    const currentBorrowCap = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`Current borrow cap is ${currentBorrowCap}`);

    const whitelistStatus = await pool.callStatic.supplyCapWhitelist(market, account);
    if (whitelistStatus == whitelist) {
      console.log(`Whitelist status is already ${whitelist}`);
      return;
    } else {
      console.log(`Whitelist status is ${whitelistStatus}, setting to ${whitelist}`);
      const tx: providers.TransactionResponse = await pool._supplyCapWhitelist(market, account, whitelist);
      await tx.wait();
      console.log(`Whitelist status for ${account} set: ${await pool.callStatic.supplyCapWhitelist(market, account)}`);
    }
  });
