import { IonicSdk } from "@ionicprotocol/sdk";
import { IonicComptroller } from "@ionicprotocol/sdk/dist/cjs/typechain/IonicComptroller";
import { SupportedAsset } from "@ionicprotocol/types";
import { constants, Contract, logger, Signer } from "ethers";

export class AdminService {
  admin: Signer;
  adminAddress: string;
  sdk: IonicSdk;
  asset: SupportedAsset;

  constructor(sdk: IonicSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.admin = sdk.signer;
    this.sdk = sdk;
  }
  async init(): Promise<AdminService> {
    this.adminAddress = await this.admin.getAddress();
    return this;
  }

  async pauseAllPools(pools: Array<IonicComptroller>) {
    for (const pool of pools) {
      const cTokenAddress = await pool.callStatic.cTokensByUnderlying(this.asset.underlying);
      const cToken = this.sdk.createICErc20(cTokenAddress, this.admin);
      await this.pauseMarketActivity(pool, cToken);
    }
  }

  private async getPauseGuardian(pool: IonicComptroller) {
    return await pool.callStatic.pauseGuardian();
  }
  private async setPauseGuardian(pool: IonicComptroller) {
    const tx = await pool._setPauseGuardian(this.adminAddress);
    await tx.wait();
    logger.info(`Set the pause guardian to ${this.adminAddress}`);
  }

  async pauseMarketActivity(pool: IonicComptroller, cToken: Contract) {
    const pauseGuardian = await this.getPauseGuardian(pool);
    if (pauseGuardian === constants.AddressZero) {
      await this.setPauseGuardian(pool);
    }
    await this.pauseMintActivity(pool, cToken);
    await this.pauseBorrowActivity(pool);
  }

  async pauseMintActivity(pool: IonicComptroller, cToken: Contract) {
    const isPaused: boolean = await pool.callStatic.mintGuardianPaused(cToken.address);
    if (!isPaused) {
      const tx = await pool._setMintPaused(cToken.address, true);
      await tx.wait();
      logger.warn(`Market mint pause tx ${tx.hash}`);
    } else {
      logger.info(`Minting already paused`);
    }
  }
  async pauseBorrowActivity(pool: IonicComptroller) {
    const markets = await this.sdk.createComptroller(pool.address).callStatic.getAllMarkets();
    for (const market of markets) {
      const isPaused: boolean = await pool.callStatic.borrowGuardianPaused(market);
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
