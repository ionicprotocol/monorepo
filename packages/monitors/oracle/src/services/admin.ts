import { MidasSdk } from "@midas-capital/sdk";
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

  async pauseAllPools(pools: Array<Contract>) {
    for (const pool of pools) {
      const cTokenAddress = await pool.callStatic.cTokensByUnderlying(this.asset.underlying);
      const cToken = this.sdk.createCToken(cTokenAddress, this.admin);
      await this.pauseMarketActivity(pool, cToken);
    }
  }

  private async getPauseGuardian(pool: Contract) {
    return await pool.pauseGuardian();
  }
  private async setPauseGuardian(pool: Contract) {
    const tx = await pool._setPauseGuardian(this.adminAddress);
    await tx.wait();
    logger.info(`Set the pause guardian to ${this.adminAddress}`);
  }

  async pauseMarketActivity(pool: Contract, cToken: Contract) {
    const pauseGuardian = await this.getPauseGuardian(pool);
    if (pauseGuardian === constants.AddressZero) {
      await this.setPauseGuardian(pool);
    }
    await this.pauseMintActivity(pool, cToken);
    await this.pauseBorrowActivity(pool);
  }

  async pauseMintActivity(pool: Contract, cToken: Contract) {
    const isPaused: boolean = await pool.mintGuardianPaused(cToken.address);
    if (!isPaused) {
      const tx = await pool._setMintPaused(cToken.address, true);
      await tx.wait();
      logger.warn(`Market mint pause tx ${tx.hash}`);
    } else {
      logger.info(`Minting already paused`);
    }
  }
  async pauseBorrowActivity(pool: Contract) {
    const markets = await pool.getAllMarkets();
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
