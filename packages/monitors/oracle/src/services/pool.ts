import { ionicComptrollerAbi, IonicSdk } from "@ionicprotocol/sdk";
import { SupportedAsset } from "@ionicprotocol/types";
import { GetContractReturnType, PublicClient, WalletClient, zeroAddress } from "viem";

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
      const comptroller: any = this.sdk.createComptroller(
        pool.comptroller,
        this.sdk.publicClient as PublicClient,
        this.sdk.walletClient as WalletClient,
      );
      const market = await comptroller.read.cTokensByUnderlying([this.asset.underlying]);
      if (market !== zeroAddress) {
        poolsWithAsset.push(comptroller);
      }
    }
    return poolsWithAsset;
  }
}
