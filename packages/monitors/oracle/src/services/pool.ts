import { MidasSdk } from "@midas-capital/sdk";
import { FusePool, SupportedAsset } from "@midas-capital/types";
import { constants, Contract } from "ethers";

import { AdminService } from "./admin";

type FP = Omit<FusePool, "blockPosted" | "timestampPosted" | "name" | "creator">;

export class PoolService {
  sdk: MidasSdk;
  asset: SupportedAsset;
  pools: FP[];
  adminService: AdminService;

  constructor(sdk: MidasSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.sdk = sdk;
  }

  async init(): Promise<PoolService> {
    this.adminService = new AdminService(this.sdk, this.asset);
    this.pools = await this.sdk.contracts.FusePoolDirectory.getAllPools();
    return this;
  }

  async getPoolsWithAsset(): Promise<Contract[]> {
    const poolsWithAsset: Contract[] = [];
    for (const pool of this.pools) {
      const comptroller = this.sdk.createComptroller(pool.comptroller, this.sdk.signer);
      const market = await comptroller.callStatic.cTokensByUnderlying(this.asset.underlying);
      if (market !== constants.AddressZero) {
        poolsWithAsset.push(comptroller);
      }
    }
    return poolsWithAsset;
  }
}
