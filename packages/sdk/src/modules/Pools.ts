import { base, mode } from "@ionicprotocol/chains";
import {
  ChainSupportedAssets as ChainSupportedAssetsType,
  IonicPoolData,
  NativePricedIonicAsset,
  Roles,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { Address, formatUnits, getAbiItem, maxUint256, toFunctionHash, zeroAddress } from "viem";

import { icErc20Abi } from "../generated";
import { filterOnlyObjectProperties, filterPoolName } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";

export type LensPoolsWithData = [
  ids: bigint[],
  ionicPools: {
    name: string;
    creator: Address;
    comptroller: Address;
    blockPosted: bigint;
    timestampPosted: bigint;
  }[],
  ionicPoolsData: {
    totalSupply: bigint;
    totalBorrow: bigint;
    underlyingTokens: Address[];
    underlyingSymbols: string[];
    whitelistedAdmin: boolean;
  }[],
  errors: boolean[]
];

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.mode]: mode.assets,
  [SupportedChains.base]: base.assets
};

export interface IIonicPools {
  fetchPoolData(poolId: string): Promise<IonicPoolData | null>;
  fetchPoolsManual(): Promise<(IonicPoolData | null)[] | undefined>;
  fetchPools({ filter, options }: { filter: string | null; options: { from: Address } }): Promise<IonicPoolData[]>;
  isAuth(pool: Address, market: Address, role: Roles, user: Address): Promise<boolean>;
  getHealthFactor(account: Address, pool: Address): Promise<bigint>;
  getHealthFactorPrediction(
    pool: Address,
    account: Address,
    cTokenModify: Address,
    redeemTokens: bigint,
    borrowAmount: bigint,
    repayAmount: bigint
  ): Promise<bigint>;
}

export function withPools<TBase extends CreateContractsModule = CreateContractsModule>(
  Base: TBase
): {
  new (...args: any[]): IIonicPools;
} & TBase {
  return class IonicPools extends Base {
    async fetchPoolData(poolId: string): Promise<IonicPoolData | null> {
      const [_unfiliteredName, creator, comptroller, blockPosted, timestampPosted] =
        await this.contracts.PoolDirectory.read.pools([BigInt(poolId)]);
      if (comptroller === zeroAddress) {
        return null;
      }
      const name = filterPoolName(_unfiliteredName);

      const res = await this.contracts.PoolLens.simulate.getPoolAssetsWithData([comptroller as Address]);
      const assets: NativePricedIonicAsset[] = res.result
        .map(filterOnlyObjectProperties)
        .map(
          (asset: NativePricedIonicAsset) =>
            ({ ...asset, underlyingDecimals: Number(asset.underlyingDecimals) }) as NativePricedIonicAsset
        );

      let totalLiquidityNative = 0;
      let totalAvailableLiquidityNative = 0;
      let totalSupplyBalanceNative = 0;
      let totalCollateralSupplyBalanceNative = 0;
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
          asset.underlyingSymbol = _asset.symbol ?? "";
          asset.logoUrl = _asset.symbol
            ? "https://d1912tcoux65lj.cloudfront.net/token/96x96/" + _asset.symbol.toLowerCase() + ".png"
            : "";
          asset.originalSymbol = _asset.originalSymbol ? _asset.originalSymbol : undefined;
        }

        asset.netSupplyBalance =
          asset.supplyBalance > asset.borrowBalance ? asset.supplyBalance - asset.borrowBalance : 0n;
        asset.netSupplyBalanceNative =
          Number(formatUnits(asset.netSupplyBalance, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));

        asset.supplyBalanceNative =
          Number(formatUnits(asset.supplyBalance, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));

        asset.borrowBalanceNative =
          Number(formatUnits(asset.borrowBalance, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));

        if (asset.membership) {
          totalCollateralSupplyBalanceNative += asset.supplyBalanceNative;
        }
        totalSupplyBalanceNative += asset.supplyBalanceNative;
        totalBorrowBalanceNative += asset.borrowBalanceNative;

        asset.totalSupplyNative =
          Number(formatUnits(asset.totalSupply, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));
        asset.totalBorrowNative =
          Number(formatUnits(asset.totalBorrow, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));

        if (asset.totalSupplyNative === 0) {
          asset.utilization = 0;
        } else {
          asset.utilization = (asset.totalBorrowNative / asset.totalSupplyNative) * 100;
        }

        totalSuppliedNative += asset.totalSupplyNative;
        totalBorrowedNative += asset.totalBorrowNative;

        const assetLiquidityNative =
          Number(formatUnits(asset.liquidity, asset.underlyingDecimals)) *
          Number(formatUnits(asset.underlyingPrice, 18));
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
        comptroller: comptroller as Address,
        name,
        totalLiquidityNative,
        totalAvailableLiquidityNative,
        totalSuppliedNative,
        totalBorrowedNative,
        totalSupplyBalanceNative,
        totalCollateralSupplyBalanceNative,
        totalBorrowBalanceNative,
        blockPosted,
        timestampPosted,
        underlyingTokens: assets.map((a) => a.underlyingToken),
        underlyingSymbols: assets.map((a) => a.underlyingSymbol),
        utilization
      };
    }

    async fetchPoolsManual(): Promise<(IonicPoolData | null)[] | undefined> {
      const [poolIndexes, pools] = await this.contracts.PoolDirectory.read.getActivePools();

      if (!pools.length || !poolIndexes.length) {
        return undefined;
      }

      const poolData = await Promise.all(
        poolIndexes.map((poolId) => {
          return this.fetchPoolData(poolId.toString()).catch((error) => {
            this.logger.error(`Pool ID ${poolId} wasn't able to be fetched from PoolLens without error.`, error);
            return null;
          });
        })
      );

      return poolData.filter((p) => !!p);
    }

    async fetchPools({
      filter,
      options
    }: {
      filter: string | null;
      options: { from: Address };
    }): Promise<IonicPoolData[]> {
      const isCreatedPools = filter === "created-pools";
      const isVerifiedPools = filter === "verified-pools";
      const isUnverifiedPools = filter === "unverified-pools";

      const _poolIds: bigint[] = [];
      if (isCreatedPools) {
        const res = await this.contracts.PoolLens.simulate.getPoolsByAccountWithData([options.from]);
        _poolIds.concat(res.result[0]);
      } else if (isVerifiedPools) {
        const res = await this.contracts.PoolDirectory.read.getPublicPoolsByVerification([true]);
        _poolIds.concat(res[0]);
      } else if (isUnverifiedPools) {
        const res = await this.contracts.PoolDirectory.read.getPublicPoolsByVerification([false]);
        _poolIds.concat(res[0]);
      } else {
        const res = await this.contracts.PoolLens.simulate.getPublicPoolsWithData();
        _poolIds.concat(res.result[0]);
      }

      const _whitelistedPoolIds = (
        await this.contracts.PoolLens.simulate.getWhitelistedPoolsByAccountWithData([options.from])
      ).result[0];

      const pools = await Promise.all(
        _poolIds.concat(_whitelistedPoolIds).map(async (_id) => {
          return this.fetchPoolData(_id.toString());
        })
      );

      const filteredPools = pools.filter((pool) => !_whitelistedPoolIds.includes(BigInt(pool?.id ?? maxUint256)));

      return filteredPools.filter((p) => !!p) as IonicPoolData[];
    }

    async isAuth(pool: Address, market: Address, role: Roles, user: Address) {
      const authRegistry = this.createAuthoritiesRegistry();
      const poolAuthAddress = await authRegistry.read.poolsAuthorities([pool]);

      if (poolAuthAddress === zeroAddress) {
        console.log(`Pool authority for pool ${pool} does not exist`);

        return false;
      }

      const poolAuth = this.createPoolRolesAuthority(poolAuthAddress);

      if (role === Roles.SUPPLIER_ROLE) {
        // let's check if it's public
        const func = getAbiItem({ abi: icErc20Abi, name: "mint" });
        const selectorHash = toFunctionHash(func);
        const isPublic = await poolAuth.read.isCapabilityPublic([market, selectorHash]);

        if (isPublic) {
          return true;
        }
      }

      return await poolAuth.read.doesUserHaveRole([user, role]);
    }

    async getHealthFactor(account: Address, pool: Address) {
      const poolLens = this.createPoolLens();
      const healthFactor = await poolLens.read.getHealthFactor([account, pool], { account });

      return healthFactor;
    }

    async getHealthFactorPrediction(
      pool: Address,
      account: Address,
      cTokenModify: Address,
      redeemTokens: bigint,
      borrowAmount: bigint,
      repayAmount: bigint
    ): Promise<bigint> {
      const poolLens = this.createPoolLens();
      const predictedHealthFactor = await poolLens.read.getHealthFactorHypothetical(
        [pool, account, cTokenModify, redeemTokens, borrowAmount, repayAmount],
        {
          account
        }
      );

      return predictedHealthFactor;
    }
  };
}
