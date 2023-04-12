import {
  arbitrum,
  basegoerli,
  bsc,
  chapel,
  ethereum,
  evmos,
  fantom,
  ganache,
  moonbeam,
  neondevnet,
  polygon,
} from "@midas-capital/chains";
import {
  ChainSupportedAssets as ChainSupportedAssetsType,
  FusePoolData,
  NativePricedFuseAsset,
  SupportedAsset,
  SupportedChains,
} from "@midas-capital/types";
import { BigNumberish, CallOverrides, constants, utils } from "ethers";

import { MidasBaseConstructor } from "..";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { FusePoolLens } from "../../typechain/FusePoolLens";
import { filterOnlyObjectProperties, filterPoolName } from "../MidasSdk/utils";

export type LensPoolsWithData = [
  ids: BigNumberish[],
  fusePools: FusePoolDirectory.FusePoolStructOutput[],
  fusePoolsData: FusePoolLens.FusePoolDataStructOutput[],
  errors: boolean[]
];

const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.ganache]: ganache.assets,
  [SupportedChains.evmos]: evmos.assets,
  [SupportedChains.chapel]: chapel.assets,
  [SupportedChains.moonbeam]: moonbeam.assets,
  [SupportedChains.neon_devnet]: neondevnet.assets,
  [SupportedChains.arbitrum]: arbitrum.assets,
  [SupportedChains.fantom]: fantom.assets,
  [SupportedChains.basegoerli]: basegoerli.assets,
  [SupportedChains.ethereum]: ethereum.assets,
};

export function withFusePools<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class FusePools extends Base {
    async fetchFusePoolData(poolId: string, overrides: CallOverrides = {}): Promise<FusePoolData | null> {
      const {
        comptroller,
        name: _unfiliteredName,
        creator,
        blockPosted,
        timestampPosted,
      } = await this.contracts.FusePoolDirectory.callStatic.pools(Number(poolId), overrides);
      if (comptroller === constants.AddressZero) {
        return null;
      }
      const name = filterPoolName(_unfiliteredName);

      const assets: NativePricedFuseAsset[] = (
        await this.contracts.FusePoolLens.callStatic.getPoolAssetsWithData(comptroller, overrides)
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

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        asset.isBorrowPaused = asset.borrowGuardianPaused;
        asset.isSupplyPaused = asset.mintGuardianPaused;
        asset.plugin = this.marketToPlugin[asset.cToken];

        const _asset = ChainSupportedAssets[this.chainId as SupportedChains].find(
          (ass) => ass.underlying === asset.underlyingToken
        );

        if (_asset) {
          asset.underlyingSymbol = _asset.symbol;
          asset.logoUrl = "https://d1912tcoux65lj.cloudfront.net/token/96x96/" + _asset.symbol.toLowerCase() + ".png";
        }

        asset.supplyBalanceNative =
          Number(utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        asset.borrowBalanceNative =
          Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        totalSupplyBalanceNative += asset.supplyBalanceNative;
        totalBorrowBalanceNative += asset.borrowBalanceNative;

        asset.totalSupplyNative =
          Number(utils.formatUnits(asset.totalSupply, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));
        asset.totalBorrowNative =
          Number(utils.formatUnits(asset.totalBorrow, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        if (asset.totalSupplyNative === 0) {
          asset.utilization = 0;
        } else {
          asset.utilization = (asset.totalBorrowNative / asset.totalSupplyNative) * 100;
        }

        totalSuppliedNative += asset.totalSupplyNative;
        totalBorrowedNative += asset.totalBorrowNative;

        const assetLiquidityNative =
          Number(utils.formatUnits(asset.liquidity, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));
        asset.liquidityNative = assetLiquidityNative;

        totalAvailableLiquidityNative += asset.isBorrowPaused ? 0 : assetLiquidityNative;
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

      // Sort array by liquidity, array is mutated in place with .sort()
      assets.sort((a, b) => b.liquidityNative - a.liquidityNative);
      return {
        id: Number(poolId),
        chainId: this.chainId,
        assets,
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
        underlyingTokens: assets.map((a) => a.underlyingToken),
        underlyingSymbols: assets.map((a) => a.underlyingSymbol),
        utilization,
      };
    }

    async fetchPoolsManual(overrides: CallOverrides = {}): Promise<(FusePoolData | null)[] | undefined> {
      const [poolIndexes, pools] = await this.contracts.FusePoolDirectory.callStatic.getActivePools(overrides);

      if (!pools.length || !poolIndexes.length) {
        return undefined;
      }

      const poolData = await Promise.all(
        poolIndexes.map((poolId) => {
          return this.fetchFusePoolData(poolId.toString(), overrides).catch((error) => {
            this.logger.error(`Pool ID ${poolId} wasn't able to be fetched from FusePoolLens without error.`, error);
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
              return this.fetchFusePoolData(_id.toString());
            })
          );
        })
      );

      const whitelistedIds = whitelistedPools.map((pool) => pool?.id);
      const filteredPools = pools.filter((pool) => !whitelistedIds.includes(pool?.id));

      return [...filteredPools, ...whitelistedPools].filter((p) => !!p) as FusePoolData[];
    }
  };
}
