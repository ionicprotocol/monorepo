import { providers } from "ethers";
import { task, types } from "hardhat/config";

export default task("market:set-supply-cap", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to set the supply cap", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("maxSupply", "Maximum amount of tokens that can be supplied", undefined, types.string)
  .setAction(async ({ admin, market, maxSupply }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    // @ts-ignore
    const midasSdkModule = await import("../../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const cToken = sdk.createCTokenWithExtensions(market, signer);
    const comptroller = await cToken.callStatic.comptroller();
    const pool = sdk.createComptroller(comptroller, signer);

    const currentSupplyCap = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`Current supply cap is ${currentSupplyCap}`);
    const newSupplyCap = ethers.BigNumber.from(maxSupply);

    if (currentSupplyCap.eq(newSupplyCap)) {
      console.log("Supply cap is already set to this value");
      return;
    }

    const tx: providers.TransactionResponse = await pool._setMarketSupplyCaps([cToken.address], [newSupplyCap]);
    await tx.wait();

    const newSupplyCapSet = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`New supply cap set: ${newSupplyCapSet.toNumber()}`);
  });

task("market:set-supply-cap-whitelist", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to set the whitelist", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("account", "Account to be whitelisted / removed from whitelist", undefined, types.string)
  .addOptionalParam("whitelist", "Set whitelist to true ot false", true, types.boolean)
  .setAction(async ({ admin, market, account, whitelist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    // @ts-ignore
    const midasSdkModule = await import("../../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const cToken = sdk.createCTokenWithExtensions(market, signer);
    const comptroller = await cToken.callStatic.comptroller();
    const pool = sdk.createComptroller(comptroller, signer);

    const currentSupplyCap = await pool.callStatic.supplyCaps(market);
    console.log(`Current supply cap is ${currentSupplyCap}`);

    const whitelistStatus = await pool.callStatic.supplyCapWhitelist(market, account);
    if (whitelistStatus == whitelist) {
      console.log(`Whitelist status is already ${whitelist}`);
      return;
    } else {
      console.log(`Whitelist status is ${whitelistStatus}, setting to ${whitelist}`);
      const tx = await pool._supplyCapWhitelist(market, account, whitelist);
      await tx.wait();
      console.log(`Whitelist status for ${account} set: ${await pool.callStatic.supplyCapWhitelist(market, account)}`);
    }
  });
