import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, providers } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { CToken } from "../../typechain/CToken";

export default task("market:unsupport", "Unsupport a market")
  .addParam("comptroller", "Comptroller Address", undefined, types.string)
  .addParam("ctoken", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    // @ts-ignoreutils/pool

    const sdk = await midasSdkModule.getOrCreateMidas();

    const comptroller = await sdk.getComptrollerInstance(taskArgs.comptroller, signer);
    const tx = await comptroller._unsupportMarket(taskArgs.ctoken);
    const receipt: TransactionReceipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });

task("market:mint-pause", "Pauses minting on a market")
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;

    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

    const market: CToken = (await hre.ethers.getContractAt("CToken.sol:CToken", taskArgs.market, admin)) as CToken;
    const comptroller = await market.comptroller();
    const pool: Comptroller = (await hre.ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      comptroller,
      admin
    )) as Comptroller;

    const currentPauseGuardian = await pool.pauseGuardian();
    if (currentPauseGuardian === constants.AddressZero) {
      tx = await pool._setPauseGuardian(admin.address);
      await tx.wait();
      console.log(`Set the pause guardian to ${admin.address}`);
    }

    const isPaused: boolean = await pool.mintGuardianPaused(market.address);
    if (isPaused != taskArgs.paused) {
      tx = await pool._setMintPaused(market.address, taskArgs.paused);
      await tx.wait();

      console.log(`Market mint pause tx ${tx.hash}`);
    } else {
      console.log(`No need to set the minting pause to ${taskArgs.paused} as it is already set to that value`);
    }

    const isPausedAfter: boolean = await pool.mintGuardianPaused(market.address);

    console.log(`The market at ${market.address} minting pause has been to ${isPausedAfter}`);

    return isPausedAfter;
  });

task("market:borrow-pause", "Pauses borrowing on a market")
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;

    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

    const market: CToken = (await hre.ethers.getContractAt("CToken.sol:CToken", taskArgs.market, admin)) as CToken;
    const comptroller = await market.comptroller();
    const pool: Comptroller = (await hre.ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      comptroller,
      admin
    )) as Comptroller;

    const currentPauseGuardian = await pool.pauseGuardian();
    if (currentPauseGuardian === constants.AddressZero) {
      tx = await pool._setPauseGuardian(admin.address);
      await tx.wait();
      console.log(`Set the pause guardian to ${admin.address}`);
    }

    const isPaused: boolean = await pool.borrowGuardianPaused(market.address);
    if (isPaused != taskArgs.paused) {
      tx = await pool._setBorrowPaused(market.address, taskArgs.paused);
      await tx.wait();

      console.log(`Market borrow pause tx ${tx.hash}`);
    } else {
      console.log(`No need to set the borrow pause to ${taskArgs.paused} as it is already set to that value`);
    }

    const isPausedAfter: boolean = await pool.borrowGuardianPaused(market.address);

    console.log(`The market at ${market.address} borrowing pause has been to ${isPausedAfter}`);

    return isPausedAfter;
  });

task("market:set-supply-cap", "Pauses borrowing on a market")
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addParam("market", "The address of the CToken", undefined, types.string)
  .addParam("maxSupply", "Maximum amount of tokens that can be supplied", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

    const market: CToken = (await hre.ethers.getContractAt("CToken.sol:CToken", taskArgs.market, admin)) as CToken;
    const comptroller = await market.comptroller();
    const pool: Comptroller = (await hre.ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      comptroller,
      admin
    )) as Comptroller;

    const currentSupplyCap = await pool.callStatic.supplyCaps(taskArgs.market);
    console.log(`Current supply cap is ${currentSupplyCap}`);

    const newSupplyCap = hre.ethers.BigNumber.from(taskArgs.maxSupply);
    const tx: providers.TransactionResponse = await pool._setMarketSupplyCaps([market.address], [newSupplyCap]);
    await tx.wait();

    const newSupplyCapSet = await pool.callStatic.supplyCaps(taskArgs.market);
    console.log(`New supply cap set: ${newSupplyCapSet.toNumber()}`);
  });
