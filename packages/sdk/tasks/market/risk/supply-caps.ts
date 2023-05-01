import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../../typechain/ComptrollerFirstExtension";
import { CToken } from "../../../typechain/CToken";

export default task("market:set-supply-cap", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("maxSupply", "Maximum amount of tokens that can be supplied", undefined, types.string)
  .setAction(async ({ admin, market, maxSupply }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const cToken: CToken = (await ethers.getContractAt("CToken.sol:CToken", market, signer)) as CToken;
    const comptroller = await cToken.callStatic.comptroller();
    const pool = (await ethers.getContractAt("Comptroller.sol:Comptroller", comptroller, signer)) as Comptroller;
    const poolExtension = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      comptroller,
      signer
    )) as ComptrollerFirstExtension;

    const currentSupplyCap = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`Current supply cap is ${currentSupplyCap}`);
    const newSupplyCap = ethers.BigNumber.from(maxSupply);

    if (currentSupplyCap.eq(newSupplyCap)) {
      console.log("Supply cap is already set to this value");
      return;
    }

    const tx: providers.TransactionResponse = await poolExtension._setMarketSupplyCaps(
      [cToken.address],
      [newSupplyCap]
    );
    await tx.wait();

    const newSupplyCapSet = await pool.callStatic.supplyCaps(cToken.address);
    console.log(`New supply cap set: ${newSupplyCapSet.toNumber()}`);
  });

task("market:set-supply-cap-whitelist", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("account", "Account to be whitelisted / removed from whitelist", undefined, types.string)
  .addOptionalParam("whitelist", "Set whitelist to true ot false", true, types.boolean)
  .setAction(async ({ admin, market, account, whitelist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const cToken: CToken = (await ethers.getContractAt("CToken.sol:CToken", market, signer)) as CToken;
    const comptroller = await cToken.callStatic.comptroller();
    const pool = (await ethers.getContractAt("Comptroller.sol:Comptroller", comptroller, signer)) as Comptroller;
    const poolExtension = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      comptroller,
      signer
    )) as ComptrollerFirstExtension;

    const currentSupplyCap = await pool.callStatic.supplyCaps(market);
    console.log(`Current supply cap is ${currentSupplyCap}`);

    const whitelistStatus = await pool.callStatic.supplyCapWhitelist(market, account);
    if (whitelistStatus == whitelist) {
      console.log(`Whitelist status is already ${whitelist}`);
      return;
    } else {
      console.log(`Whitelist status is ${whitelistStatus}, setting to ${whitelist}`);
      const tx = await poolExtension._supplyCapWhitelist(market, account);
      await tx.wait();
      console.log(`Whitelist status for ${account} set: ${await pool.callStatic.supplyCapWhitelist(market, account)}`);
    }
  });
