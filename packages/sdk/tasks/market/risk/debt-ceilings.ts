import { providers } from "ethers";
import { task, types } from "hardhat/config";

import ERC20UpgradeableAbi from "../../../abis/ERC20Upgradeable";

export default task("market:set-debt-ceiling", "Sets debt ceiling for market against another")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("collat", "The address of the collateral CToken", undefined, types.string)
  .addParam("borrow", "The address of the borrow CToken", undefined, types.string)
  .addParam(
    "maxDebt",
    "Maximum amount of debt that can be accrued, denominated in the borrowed asset",
    undefined,
    types.string
  )
  .setAction(async ({ admin, collat, borrow, maxDebt }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const midasSdkModule = await import("../../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const collatCToken = sdk.createCTokenWithExtensions(collat, signer);
    const borrowCToken = sdk.createCTokenWithExtensions(borrow, signer);
    const borrowUl = new ethers.Contract(await borrowCToken.callStatic.underlying(), ERC20UpgradeableAbi, signer);

    const comptroller = await collatCToken.callStatic.comptroller();
    if (comptroller !== (await borrowCToken.callStatic.comptroller())) {
      throw new Error("Comptrollers do not match");
    }

    const pool = sdk.createComptroller(comptroller, signer);

    const currentDebtCeilings = await pool.callStatic.borrowCapForCollateral(
      borrowCToken.address,
      collatCToken.address
    );

    console.log(`Current debt ceiling is ${currentDebtCeilings}`);
    const newDebtCeiling = ethers.utils.parseUnits(maxDebt, await borrowUl.decimals());

    if (currentDebtCeilings.eq(newDebtCeiling)) {
      console.log("Debt ceilings already set to this value");
      return;
    }

    const tx: providers.TransactionResponse = await pool._setBorrowCapForCollateral(
      borrowCToken.address,
      collatCToken.address,
      newDebtCeiling
    );
    await tx.wait();

    const newBorrowCapSet = await pool.callStatic.borrowCapForCollateral(borrowCToken.address, collatCToken.address);

    console.log(
      `New borrow cap set: ${newBorrowCapSet.toNumber()} for ${borrowCToken.address} borrows with ${
        collatCToken.address
      } collateral`
    );
  });

task("market:set-debt-ceiling-whitelist", "Whitelists an account for the borrowing against collateral cap")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("collat", "The address of the collateral CToken", undefined, types.string)
  .addParam("borrow", "The address of the borrow CToken", undefined, types.string)
  .addParam("account", "Address to whitelist", undefined, types.string)
  .addOptionalParam("whitelist", "Set whitelist to true ot false", true, types.boolean)
  .setAction(async ({ admin, collat, borrow, account, whitelist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const midasSdkModule = await import("../../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const collatCToken = sdk.createCTokenWithExtensions(collat, signer);
    const borrowCToken = sdk.createCTokenWithExtensions(borrow, signer);

    const comptroller = await collatCToken.callStatic.comptroller();
    if (comptroller !== (await borrowCToken.callStatic.comptroller())) {
      throw new Error("Comptrollers do not match");
    }
    const pool = sdk.createComptroller(comptroller, signer);
    const whitelistStatus = await pool.callStatic.borrowCapForCollateralWhitelist(
      borrowCToken.address,
      collatCToken.address,
      account
    );
    if (whitelistStatus == whitelist) {
      console.log(`Whitelist status is already ${whitelist}`);
      return;
    } else {
      console.log(`Whitelist status is ${whitelistStatus}, setting to ${whitelist}`);
      const tx = await pool._setBorrowCapForCollateralWhitelist(
        borrowCToken.address,
        collatCToken.address,
        account,
        whitelist
      );
      await tx.wait();
      console.log(
        `Whitelist status for ${account} set: ${await pool.borrowCapForCollateralWhitelist(
          borrowCToken.address,
          collatCToken.address,
          account
        )}`
      );
    }
  });

task("debt-ceilings:print")
  .addOptionalParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .setAction(async ({ admin }, { run }) => {
  const hayMarket = "0x10b6f851225c203eE74c369cE876BEB56379FCa3";
  const ankrBNBMarket = "0xb2b01D6f953A28ba6C8f9E22986f5bDDb7653aEa";

  const collaterals1 = [
    "0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB",
    "0xbc65FE441545E9e8f97E50F70526B7E8963826bc",
    "0x04b6895d7AD8b10a1a13C749159226249a3b8515"
  ];

  const collaterals2 = [
    "0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB",
    "0xbc65FE441545E9e8f97E50F70526B7E8963826bc",
    "0x04b6895d7AD8b10a1a13C749159226249a3b8515",
    "0x71693C84486B37096192c9942852f542543639Bf",
    "0x5156bC51ed3C2cE6cc59c0b68F9d68916782618f"
  ];

  const maxDebt = "0";
  for (const collateralMarket of collaterals1) {
    await run("market:print-debt-ceiling", {
      admin,
      collat: collateralMarket,
      borrow: hayMarket,
      maxDebt
    });
  }

  for (const collateralMarket of collaterals2) {
    await run("market:print-debt-ceiling", {
      admin,
      collat: collateralMarket,
      borrow: hayMarket,
      maxDebt
    });
    await run("market:print-debt-ceiling", {
      admin,
      collat: collateralMarket,
      borrow: ankrBNBMarket,
      maxDebt
    });
  }
});

task("market:print-debt-ceiling", "Prints debt ceiling for market against another")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("collat", "The address of the collateral CToken", undefined, types.string)
  .addParam("borrow", "The address of the borrow CToken", undefined, types.string)
  .addParam(
    "maxDebt",
    "Maximum amount of debt that can be accrued, denominated in the borrowed asset",
    undefined,
    types.string
  )
  .setAction(async ({ admin, collat, borrow, maxDebt }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const midasSdkModule = await import("../../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const collatCToken = sdk.createCTokenWithExtensions(collat, signer);
    const borrowCToken = sdk.createCTokenWithExtensions(borrow, signer);

    const comptroller = await collatCToken.callStatic.comptroller();
    if (comptroller !== (await borrowCToken.callStatic.comptroller())) {
      throw new Error("Comptrollers do not match");
    }

    const pool = sdk.createComptroller(comptroller, signer);

    const currentDebtCeilings = await pool.callStatic.borrowCapForCollateral(
      borrowCToken.address,
      collatCToken.address
    );

    console.log(`${borrow} , ${collat} : ${currentDebtCeilings}`);
  });

task("debt-ceiling:whitelist:ankr")
  .setAction(async ({ admin, collat, borrow, accountToWhitelist }, { run }) => {
    const hayMarket = "0x10b6f851225c203eE74c369cE876BEB56379FCa3";
    const ankrBNBMarket = "0xb2b01D6f953A28ba6C8f9E22986f5bDDb7653aEa";

    const account1 = "0x906A2E1E6Bb24A1D9d50AD1315dA46c861d11B14";
    const account2 = "0x28C0208b7144B511C73586Bb07dE2100495e92f3";

    const collaterals1 = [
      "0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB",
      "0xbc65FE441545E9e8f97E50F70526B7E8963826bc",
      "0x04b6895d7AD8b10a1a13C749159226249a3b8515"
    ];

    const collaterals2 = [
      "0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB",
      "0xbc65FE441545E9e8f97E50F70526B7E8963826bc",
      "0x04b6895d7AD8b10a1a13C749159226249a3b8515",
      "0x71693C84486B37096192c9942852f542543639Bf",
      "0x5156bC51ed3C2cE6cc59c0b68F9d68916782618f"
    ];

    for (const collateralMarket of collaterals1) {
      await run("market:set-debt-ceiling-whitelist", {
        admin,
        collat: collateralMarket,
        borrow: hayMarket,
        account: account1
      });
    }

    for (const collateralMarket of collaterals2) {
      await run("market:set-debt-ceiling-whitelist", {
        admin,
        collat: collateralMarket,
        borrow: hayMarket,
        account: account2
      });
      await run("market:set-debt-ceiling-whitelist", {
        admin,
        collat: collateralMarket,
        borrow: ankrBNBMarket,
        account: account2
      });
    }

});
