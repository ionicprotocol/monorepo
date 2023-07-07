import { MidasSdk } from "@ionicprotocol/sdk";
import { CErc20Delegate } from "@ionicprotocol/sdk/dist/cjs/typechain/CErc20Delegate";
import { constants, Contract, logger, Signer } from "ethers";

import { baseConfig } from "../config";
import { ComptrollerWithExtension } from "../types";

export class AdminService {
  admin: Signer;
  adminAddress: string;
  sdk: MidasSdk;

  constructor(sdk: MidasSdk) {
    this.adminAddress = baseConfig.adminAccount;
    this.admin = sdk.signer;
    this.sdk = sdk;
  }
  async init(): Promise<AdminService> {
    this.adminAddress = await this.admin.getAddress();
    return this;
  }

  async pauseAllPoolsWithUnderlying(pools: Array<ComptrollerWithExtension>, underlying: string) {
    for (const pool of pools) {
      const cTokenAddress = await pool.callStatic.cTokensByUnderlying(underlying);
      const cToken = this.sdk.createCTokenWithExtensions(cTokenAddress, this.admin);
      await this.pauseMarketActivity(pool, cToken);
    }
  }

  private async getPauseGuardian(pool: ComptrollerWithExtension) {
    return await pool.callStatic.pauseGuardian();
  }
  private async setPauseGuardian(pool: Contract) {
    const tx = await pool._setPauseGuardian(this.adminAddress);
    await tx.wait();
    logger.info(`Set the pause guardian to ${this.adminAddress}`);
  }

  async pauseMarketActivity(pool: ComptrollerWithExtension, cToken: CErc20Delegate) {
    const pauseGuardian = await this.getPauseGuardian(pool);
    if (pauseGuardian === constants.AddressZero) {
      await this.setPauseGuardian(pool);
    }
    await this.pauseMintActivity(pool, cToken);
    await this.pauseBorrowActivity(pool);
  }

  async pauseMintActivity(pool: ComptrollerWithExtension, cToken: CErc20Delegate) {
    const isPaused: boolean = await pool.callStatic.mintGuardianPaused(cToken.address);
    if (!isPaused) {
      const tx = await pool._setMintPaused(cToken.address, true);
      await tx.wait();
      logger.warn(`Market mint pause tx ${tx.hash}`);
    } else {
      logger.info(`Minting already paused`);
    }
  }
  async pauseBorrowActivity(pool: ComptrollerWithExtension) {
    const markets = await this.sdk.createComptroller(pool.address).callStatic.getAllMarkets();
    for (const market of markets) {
      const isPaused: boolean = await pool.borrowGuardianPaused(market);
      if (!isPaused) {
        const tx = await pool._setBorrowPaused(market, true);
        await tx.wait();
        logger.warn(`Market borrow pause tx ${tx.hash}`);
      } else {
        logger.info(`Borrowing already paused`);
      }
    }
  }
}
