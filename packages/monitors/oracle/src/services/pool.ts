import { MidasSdk } from "@midas-capital/sdk";
import { Comptroller } from "@midas-capital/sdk/dist/cjs/lib/contracts/typechain/Comptroller";
import { SupportedAsset } from "@midas-capital/types";
import { constants } from "ethers";

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

  async getPoolsWithAsset(): Promise<Comptroller[]> {
    const poolsWithAsset: Comptroller[] = [];
    const [, pools] = await this.sdk.contracts.FusePoolDirectory.getActivePools();
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
