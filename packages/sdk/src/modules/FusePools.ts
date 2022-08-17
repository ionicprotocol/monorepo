import { FusePoolData, NativePricedFuseAsset, SupportedAsset } from "@midas-capital/types";
import { BigNumberish, utils } from "ethers";

import { MidasBaseConstructor } from "..";
import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CErc20PluginDelegate } from "../../lib/contracts/typechain/CErc20PluginDelegate";
import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";
import { FusePoolLens } from "../../lib/contracts/typechain/FusePoolLens";
import { filterOnlyObjectProperties, filterPoolName, getContract } from "../MidasSdk/utils";

export type LensPoolsWithData = [
  ids: BigNumberish[],
  fusePools: FusePoolDirectory.FusePoolStructOutput[],
  fusePoolsData: FusePoolLens.FusePoolDataStructOutput[],
  errors: boolean[]
];

export function withFusePools<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class FusePools extends Base {
    async fetchFusePoolData(poolId: string, address?: string): Promise<FusePoolData> {
      const {
        comptroller,
        name: _unfiliteredName,
        creator,
        blockPosted,
        timestampPosted,
      } = await this.contracts.FusePoolDirectory.pools(Number(poolId));

      const rawData = await this.contracts.FusePoolLens.callStatic.getPoolSummary(comptroller);

      const underlyingTokens = rawData[2];
      const underlyingSymbols = rawData[3];
      const whitelistedAdmin = rawData[4];

      const name = filterPoolName(_unfiliteredName);

      const assets: NativePricedFuseAsset[] = (
        await this.contracts.FusePoolLens.callStatic.getPoolAssetsWithData(comptroller, {
          from: address,
        })
      ).map(filterOnlyObjectProperties);

      let totalLiquidityNative = 0;
      let totalAvailableLiquidityNative = 0;
      let totalSupplyBalanceNative = 0;
      let totalBorrowBalanceNative = 0;
      let totalSuppliedNative = 0;
      let totalBorrowedNative = 0;
      let suppliedForUtilization = 0;
      let borrowedForUtilization = 0;
      let utilization = 0;

      const promises: Promise<any>[] = [];

      const comptrollerContract = getContract(
        comptroller,
        this.chainDeployment.Comptroller.abi,
        this.provider.getSigner()
      );
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        const isBorrowPaused: boolean = await comptrollerContract.callStatic.borrowGuardianPaused(asset.cToken);
        asset.isBorrowPaused = isBorrowPaused;
        // @todo aggregate the borrow/supply guardian paused into 1
        promises.push(
          comptrollerContract.callStatic
            .mintGuardianPaused(asset.cToken)
            .then((isPaused: boolean) => (asset.isSupplyPaused = isPaused))
        );

        promises.push(
          (async () => {
            let plugin: string | undefined = undefined;

            plugin = await this.getAssetInstance<CErc20PluginDelegate>(asset.cToken, "CErc20PluginDelegate")
              .callStatic.plugin()
              .catch(() => undefined);
            if (!plugin) {
              // @ts-ignore
              plugin = await this.getAssetInstance<CErc20PluginRewardsDelegate>(
                asset.cToken,
                "CErc20PluginRewardsDelegate"
              )
                .callStatic.plugin()
                .catch(() => undefined);
            }
            if (!plugin) return;

            asset.plugin = plugin;
          })()
        );

        asset.supplyBalanceNative =
          Number(utils.formatUnits(asset.supplyBalance)) * Number(utils.formatUnits(asset.underlyingPrice));

        asset.borrowBalanceNative =
          Number(utils.formatUnits(asset.borrowBalance)) * Number(utils.formatUnits(asset.underlyingPrice));

        totalSupplyBalanceNative += asset.supplyBalanceNative;
        totalBorrowBalanceNative += asset.borrowBalanceNative;

        asset.totalSupplyNative =
          Number(utils.formatUnits(asset.totalSupply)) * Number(utils.formatUnits(asset.underlyingPrice));
        asset.totalBorrowNative =
          Number(utils.formatUnits(asset.totalBorrow)) * Number(utils.formatUnits(asset.underlyingPrice));

        if (asset.totalSupplyNative === 0) {
          asset.utilization = 0;
        } else {
          asset.utilization = (asset.totalBorrowNative / asset.totalSupplyNative) * 100;
        }
        const assetLiquidity =
          Number(utils.formatUnits(asset.liquidity)) * Number(utils.formatUnits(asset.underlyingPrice));

        totalSuppliedNative += asset.totalSupplyNative;
        totalBorrowedNative += asset.totalBorrowNative;

        asset.liquidityNative = assetLiquidity;

        totalAvailableLiquidityNative += asset.isBorrowPaused ? 0 : assetLiquidity;
        totalLiquidityNative += asset.liquidityNative;

        if (!asset.isBorrowPaused) {
          suppliedForUtilization += asset.totalSupplyNative;
          borrowedForUtilization += asset.totalBorrowNative;
        }

        const supportedAsset = this.supportedAssets.find(
          (_asset: SupportedAsset) => _asset.underlying === asset.underlyingToken
        );

        asset.extraDocs = supportedAsset ? supportedAsset.extraDocs : "";
      }

      if (suppliedForUtilization !== 0) {
        utilization = (borrowedForUtilization / suppliedForUtilization) * 100;
      }

      await Promise.all(promises);

      return {
        id: Number(poolId),
        assets: assets.sort((a, b) => (b.liquidityNative > a.liquidityNative ? 1 : -1)),
        creator,
        comptroller,
        name,
        totalLiquidityNative,
        totalAvailableLiquidityNative,
        totalSuppliedNative,
        totalBorrowedNative,
        totalSupplyBalanceNative,
        totalBorrowBalanceNative,
        blockPosted,
        timestampPosted,
        underlyingTokens,
        underlyingSymbols,
        whitelistedAdmin,
        utilization,
      };
    }

    async fetchPoolsManual({ options }: { options: { from: string } }): Promise<(FusePoolData | null)[] | undefined> {
      const res = await this.contracts.FusePoolDirectory.callStatic.getAllPools();

      if (!res.length) {
        return undefined;
      }

      const poolData = await Promise.all(
        res.map((pool, i) => {
          return this.fetchFusePoolData(i.toString(), options.from).catch((error) => {
            console.error(`Pool ID ${i} wasn't able to be fetched from FusePoolLens without error.`, error);
            return null;
          });
        })
      );

      return poolData.filter((p) => !!p);
    }

    async fetchPools({
      filter,
      options,
    }: {
      filter: string | null;
      options: { from: string };
    }): Promise<FusePoolData[]> {
      const isCreatedPools = filter === "created-pools";
      const isVerifiedPools = filter === "verified-pools";
      const isUnverifiedPools = filter === "unverified-pools";

      const req = isCreatedPools
        ? this.contracts.FusePoolLens.callStatic.getPoolsByAccountWithData(options.from)
        : isVerifiedPools
        ? this.contracts.FusePoolDirectory.callStatic.getPublicPoolsByVerification(true)
        : isUnverifiedPools
        ? this.contracts.FusePoolDirectory.callStatic.getPublicPoolsByVerification(false)
        : this.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();

      const whitelistedPoolsRequest = this.contracts.FusePoolLens.callStatic.getWhitelistedPoolsByAccountWithData(
        options.from
      );

      const responses = await Promise.all([req, whitelistedPoolsRequest]);

      const [pools, whitelistedPools] = await Promise.all(
        responses.map(async (poolData) => {
          return await Promise.all(
            poolData[0].map((_id) => {
              return this.fetchFusePoolData(_id.toString(), options.from);
            })
          );
        })
      );

      const whitelistedIds = whitelistedPools.map((pool) => pool?.id);
      const filteredPools = pools.filter((pool) => !whitelistedIds.includes(pool?.id));

      return [...filteredPools, ...whitelistedPools];
    }

    getAssetInstance = <T extends CErc20Delegate = CErc20Delegate>(
      address: string,
      implementation: "CErc20Delegate" | "CErc20PluginDelegate" | "CErc20PluginRewardsDelegate" = "CErc20Delegate"
    ): T => {
      switch (implementation) {
        case "CErc20PluginDelegate":
          return getContract(address, this.chainDeployment[implementation].abi, this.provider) as T;
        case "CErc20PluginRewardsDelegate":
          return getContract(address, this.chainDeployment[implementation].abi, this.provider) as T;
        default:
          return getContract(address, this.chainDeployment[implementation].abi, this.provider) as T;
      }
    };
  };
}
