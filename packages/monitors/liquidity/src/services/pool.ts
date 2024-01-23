import { IonicSdk } from "@ionicprotocol/sdk";
import { IonicComptroller } from "@ionicprotocol/sdk/dist/cjs/typechain/ComptrollerInterface.sol/IonicComptroller";
import { SupportedAsset } from "@ionicprotocol/types";
import { constants } from "ethers";

export class PoolService {
  sdk: IonicSdk;
  assets: SupportedAsset[];

  constructor(sdk: IonicSdk, assets: SupportedAsset[]) {
    this.assets = assets;
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
      const promises = this.assets.map((asset) => {
        return comptroller.callStatic.cTokensByUnderlying(asset.underlying);
      });
      const cTokens = await (await Promise.all(promises)).filter((cToken) => cToken !== constants.AddressZero);
      if (cTokens.length > 0) {
        poolsWithAsset.push(comptroller);
      }
    }
    return poolsWithAsset;
  }
}
