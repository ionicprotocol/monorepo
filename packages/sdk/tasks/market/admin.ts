import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, providers } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { ICErc20 } from "../../typechain/CTokenInterfaces.sol/ICErc20";
import { PoolDirectory } from "../../typechain/PoolDirectory";

export default task("market:unsupport", "Unsupport a market")
  .addParam("pool", "Comptroller Address", undefined, types.string)
  .addParam("market", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async ({ pool, market }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

    const comptroller = sdk.createComptroller(pool, signer);
    const tx = await comptroller._unsupportMarket(market);
    const receipt: TransactionReceipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });

task("market:set:ltv", "Set the LTV (loan to value / collateral factor) of a market")
  .addParam("marketAddress", "Address of the market", undefined, types.string)
  .addParam("ltv", "The LTV as a floating point value between 0 and 1", undefined, types.string)
  .setAction(async ({ marketAddress, ltv }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    const market = (await ethers.getContractAt("CTokenInterfaces.sol:ICErc20", marketAddress)) as ICErc20;
    const poolAddress = await market.callStatic.comptroller();
    const pool = (await ethers.getContractAt("Comptroller.sol:Comptroller", poolAddress, signer)) as Comptroller;

    const ltvMantissa = ethers.utils.parseUnits(ltv, 18);
    console.log(`will set the LTV of market ${marketAddress} to ${ltvMantissa}`);

    const tx = await pool._setCollateralFactor(marketAddress, ltvMantissa);
    console.log(`_setCollateralFactor tx ${tx.hash}`);
    await tx.wait();
    console.log(`mined tx ${tx.hash}`);
  });

task("market:mint-pause", "Pauses minting on a market")
  .addParam("markets", "The address of the CTokens", undefined, types.string)
  .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;

    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);
    const markets = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = (await hre.ethers.getContractAt("CTokenInterfaces.sol:ICErc20", marketAddress, admin)) as ICErc20;
      const comptroller = await market.callStatic.comptroller();
      const pool = (await hre.ethers.getContractAt("Comptroller.sol:Comptroller", comptroller, admin)) as Comptroller;
      const poolExtension = (await hre.ethers.getContractAt(
        "ComptrollerFirstExtension",
        comptroller,
        admin
      )) as ComptrollerFirstExtension;

      const currentPauseGuardian = await pool.callStatic.pauseGuardian();
      if (currentPauseGuardian === constants.AddressZero) {
        tx = await poolExtension._setPauseGuardian(admin.address);
        await tx.wait();
        console.log(`Set the pause guardian to ${admin.address}`);
      }

      const isPaused: boolean = await pool.callStatic.mintGuardianPaused(market.address);
      console.log(`The market at ${market.address} minting pause is currently set to ${isPaused}`);

      if (isPaused != taskArgs.paused) {
        tx = await poolExtension._setMintPaused(market.address, taskArgs.paused);
        await tx.wait();

        console.log(`Market mint pause tx ${tx.hash}`);
      } else {
        console.log(`No need to set the minting pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.callStatic.mintGuardianPaused(market.address);

      console.log(`The market at ${market.address} minting pause has been to ${isPausedAfter}`);
    }
  });

task("markets:borrow-pause", "Pauses borrowing on a market")
  .addParam("markets", "The address of the CToken", undefined, types.string)
  .addOptionalParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;

    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);
    const markets = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = (await hre.ethers.getContractAt("CTokenInterfaces.sol:ICErc20", marketAddress, admin)) as ICErc20;
      const comptroller = await market.callStatic.comptroller();
      const pool = (await hre.ethers.getContractAt("Comptroller.sol:Comptroller", comptroller, admin)) as Comptroller;
      const poolExtension = (await hre.ethers.getContractAt(
        "ComptrollerFirstExtension",
        comptroller,
        admin
      )) as ComptrollerFirstExtension;

      const currentPauseGuardian = await pool.callStatic.pauseGuardian();
      console.log(`pool ${pool.address} guardian ${currentPauseGuardian}`);
      if (currentPauseGuardian === constants.AddressZero) {
        tx = await poolExtension._setPauseGuardian(admin.address);
        await tx.wait();
        console.log(`Set the pause guardian to ${admin.address}`);
      }

      const isPaused: boolean = await pool.callStatic.borrowGuardianPaused(market.address);
      if (isPaused != taskArgs.paused) {
        console.log(`setting market ${market.address} pause to ${taskArgs.paused}`);
        tx = await poolExtension._setBorrowPaused(market.address, taskArgs.paused);
        console.log(`waiting for tx ${tx.hash}`);
        await tx.wait();

        console.log(`Market borrow pause tx ${tx.hash}`);
      } else {
        console.log(`No need to set the borrow pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.callStatic.borrowGuardianPaused(market.address);

      console.log(`The market at ${market.address} borrowing pause has been to ${isPausedAfter}`);
    }
  });

task("markets:all:pause", "Pauses borrowing on a market")
  .addOptionalParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, hre) => {
    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

    const poolDirectory = (await hre.ethers.getContract("PoolDirectory")) as PoolDirectory;

    const [, poolData] = await poolDirectory.callStatic.getActivePools();

    for (const pool of poolData) {
      const poolExtension = (await hre.ethers.getContractAt(
        "ComptrollerFirstExtension",
        pool.comptroller,
        admin
      )) as ComptrollerFirstExtension;

      const markets = await poolExtension.callStatic.getAllMarkets();

      await hre.run("markets:borrow-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
      await hre.run("market:mint-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
    }
  });
