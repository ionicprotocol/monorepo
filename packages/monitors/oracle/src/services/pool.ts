import { IonicSdk } from "@ionicprotocol/sdk";
import { IonicComptroller } from "@ionicprotocol/sdk/dist/cjs/typechain/IonicComptroller";
import { SupportedAsset } from "@ionicprotocol/types";
import { constants } from "ethers";

export class PoolService {
  sdk: IonicSdk;
  asset: SupportedAsset;

  constructor(sdk: IonicSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.sdk = sdk;
  }

  async init(): Promise<PoolService> {
    return this;
  }

  async getPoolsWithAsset(): Promise<IonicComptroller[]> {
    const poolsWithAsset: IonicComptroller[] = [];
    const [, pools] = await this.sdk.contracts.PoolDirectory.getActivePools();
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
