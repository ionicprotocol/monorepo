import { providers } from "ethers";
import { task, types } from "hardhat/config";

export default task("market:set-asset-blacklist", "Set borrow blacklist of collateral against borrowable")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("collat", "The address of the collateral CToken", undefined, types.string)
  .addParam("borrow", "The address of the borrow CToken", undefined, types.string)
  .addParam("blacklist", "If blacklisted or not", true, types.boolean)
  .setAction(async ({ admin, collat, borrow, blacklist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);

    const collatCToken = sdk.createICErc20(collat, signer);
    const borrowCToken = sdk.createICErc20(borrow, signer);

    const comptroller = await collatCToken.callStatic.comptroller();
    if (comptroller !== (await borrowCToken.callStatic.comptroller())) {
      throw new Error("Comptrollers do not match");
    }
    const pool = sdk.createComptroller(comptroller, signer);

    const blacklisted = await pool.callStatic.borrowingAgainstCollateralBlacklist(
      borrowCToken.address,
      collatCToken.address
    );
    console.log(`Current blacklist status cap is ${blacklisted}`);
    if (blacklisted == blacklist) {
      console.log(`${collatCToken.address} is already in status ${blacklist} for ${borrowCToken.address} borrow`);
      return;
    }
    const tx: providers.TransactionResponse = await pool._blacklistBorrowingAgainstCollateral(
      borrowCToken.address,
      collatCToken.address,
      blacklist
    );
    await tx.wait();

    const newStatus = await pool.callStatic.borrowingAgainstCollateralBlacklist(
      borrowCToken.address,
      collatCToken.address
    );
    console.log(`New status set: ${newStatus}`);
  });

task("market:set-asset-blacklist-whitelist", "Pauses borrowing on a market")
  .addParam("collats", "The address of the collateral CToken", undefined, types.string)
  .addParam("borrow", "The address of the borrow CToken", undefined, types.string)
  .addParam("account", "The account to whitelist", undefined, types.string)
  .addParam("whitelist", "To whitelist or not", true, types.boolean)
  .setAction(async ({ admin, collats, borrow, account, whitelist }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);

    const collterals = collats.split(",");

    const borrowCToken = sdk.createICErc20(borrow, signer);

    const comptroller = await borrowCToken.callStatic.comptroller();

    for (const collat of collterals) {
      if (comptroller !== (await borrowCToken.callStatic.comptroller())) {
        throw new Error("Comptrollers do not match");
      }
      const pool = sdk.createComptroller(comptroller, signer);
      const collatCToken = sdk.createICErc20(collat, signer);

      const whitelistStatus = await pool.callStatic.isBorrowingAgainstCollateralBlacklistWhitelisted(
        borrowCToken.address,
        collatCToken.address,
        account
      );
      if (whitelistStatus == whitelist) {
        console.log(`Whitelist status is already ${whitelist}`);
        return;
      } else {
        console.log(`Whitelist status is ${whitelistStatus}, setting to ${whitelist}`);
        const tx: providers.TransactionResponse = await pool._blacklistBorrowingAgainstCollateralWhitelist(
          borrowCToken.address,
          collatCToken.address,
          account,
          whitelist
        );
        await tx.wait();
        console.log(
          `Whitelist status for ${account} set: ${await pool.callStatic.isBorrowingAgainstCollateralBlacklistWhitelisted(
            borrowCToken.address,
            collatCToken.address,
            account
          )}`
        );
      }
    }
  });
