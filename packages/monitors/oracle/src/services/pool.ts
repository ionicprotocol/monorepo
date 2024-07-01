import { ionicComptrollerAbi, IonicSdk } from "@ionicprotocol/sdk";
import { SupportedAsset } from "@ionicprotocol/types";
import { constants } from "ethers";
import { GetContractReturnType, PublicClient } from "viem";

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

  async getPoolsWithAsset(): Promise<GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>[]> {
    const poolsWithAsset: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>[] = [];
    const [, pools] = await this.sdk.contracts.PoolDirectory.read.getActivePools();
    for (const pool of pools) {
      const comptroller = this.sdk.createComptroller(pool.comptroller, this.sdk.publicClient, this.sdk.walletClient);
      const market = await comptroller.read.cTokensByUnderlying([this.asset.underlying]);
      if (market !== constants.AddressZero) {
        poolsWithAsset.push(comptroller);
      }
    }
    return poolsWithAsset;
  }
}
