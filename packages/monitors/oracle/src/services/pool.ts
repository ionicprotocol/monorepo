import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";
import { constants, Contract } from "ethers";

export class PoolService {
  sdk: MidasSdk;
  asset: SupportedAsset;

  constructor(sdk: MidasSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.sdk = sdk;
  }

  async init(): Promise<PoolService> {
    return this;
  }

  async getPoolsWithAsset(): Promise<Contract[]> {
    const poolsWithAsset: Contract[] = [];
    const pools = await this.sdk.contracts.FusePoolDirectory.getAllPools();
    for (const pool of pools) {
      const comptroller = this.sdk.createComptroller(pool.comptroller, this.sdk.signer);
      const market = await comptroller.callStatic.cTokensByUnderlying(this.asset.underlying);
      if (market !== constants.AddressZero) {
        poolsWithAsset.push(comptroller);
      }
    }
    return poolsWithAsset;
  }
}
