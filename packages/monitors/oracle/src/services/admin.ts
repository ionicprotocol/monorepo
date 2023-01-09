import { MidasSdk } from "@midas-capital/sdk";
import { Comptroller } from "@midas-capital/sdk/dist/cjs/typechain/Comptroller";
import { ComptrollerFirstExtension } from "@midas-capital/sdk/dist/cjs/typechain/ComptrollerFirstExtension";
import { SupportedAsset } from "@midas-capital/types";
import { constants, Contract, logger, Signer } from "ethers";

export class AdminService {
  admin: Signer;
  adminAddress: string;
  sdk: MidasSdk;
  asset: SupportedAsset;

  constructor(sdk: MidasSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.admin = sdk.signer;
    this.sdk = sdk;
  }
  async init(): Promise<AdminService> {
    this.adminAddress = await this.admin.getAddress();
    return this;
  }

  async pauseAllPools(pools: Array<Comptroller>) {
    for (const pool of pools) {
      const cTokenAddress = await pool.callStatic.cTokensByUnderlying(this.asset.underlying);
      const poolExtension = this.sdk.createComptroller(pool.address, this.sdk.signer);
      const cToken = this.sdk.createCTokenWithExtensions(cTokenAddress, this.admin);
      await this.pauseMarketActivity(pool, poolExtension, cToken);
    }
  }

  private async getPauseGuardian(pool: ComptrollerFirstExtension) {
    return await pool.callStatic.pauseGuardian();
  }
  private async setPauseGuardian(pool: ComptrollerFirstExtension) {
    const tx = await pool._setPauseGuardian(this.adminAddress);
    await tx.wait();
    logger.info(`Set the pause guardian to ${this.adminAddress}`);
  }

  async pauseMarketActivity(pool: Comptroller, extension: ComptrollerFirstExtension, cToken: Contract) {
    const pauseGuardian = await this.getPauseGuardian(extension);
    if (pauseGuardian === constants.AddressZero) {
      await this.setPauseGuardian(extension);
    }
    await this.pauseMintActivity(pool, extension, cToken);
    await this.pauseBorrowActivity(pool, extension);
  }

  async pauseMintActivity(pool: Comptroller, extension: ComptrollerFirstExtension, cToken: Contract) {
    const isPaused: boolean = await pool.callStatic.mintGuardianPaused(cToken.address);
    if (!isPaused) {
      const tx = await extension._setMintPaused(cToken.address, true);
      await tx.wait();
      logger.warn(`Market mint pause tx ${tx.hash}`);
    } else {
      logger.info(`Minting already paused`);
    }
  }
  async pauseBorrowActivity(pool: Comptroller, extension: ComptrollerFirstExtension) {
    const markets = await this.sdk.getComptrollerInstance(pool.address).callStatic.getAllMarkets();
    for (const market of markets) {
      const isPaused: boolean = await pool.callStatic.borrowGuardianPaused(market);
      if (!isPaused) {
        const tx = await extension._setBorrowPaused(market, true);
        await tx.wait();
        logger.warn(`Market borrow pause tx ${tx.hash}`);
      } else {
        logger.info(`Borrowing already paused`);
      }
    }
  }
}
