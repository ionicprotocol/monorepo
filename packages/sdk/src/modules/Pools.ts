import { arbitrum, bsc, chapel, ethereum, ganache, linea, mode, neon, polygon, zkevm } from "@ionicprotocol/chains";
import {
  ChainSupportedAssets as ChainSupportedAssetsType,
  IonicPoolData,
  NativePricedIonicAsset,
  Roles,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { BigNumberish, CallOverrides, constants, utils } from "ethers";

import { PoolDirectory } from "../../typechain/PoolDirectory";
import { PoolLens } from "../../typechain/PoolLens";
import { filterOnlyObjectProperties, filterPoolName } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";

export type LensPoolsWithData = [
  ids: BigNumberish[],
  ionicPools: PoolDirectory.PoolStructOutput[],
  ionicPoolsData: PoolLens.IonicPoolDataStructOutput[],
  errors: boolean[]
];

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.ganache]: ganache.assets,
  [SupportedChains.chapel]: chapel.assets,
  [SupportedChains.neon]: neon.assets,
  [SupportedChains.arbitrum]: arbitrum.assets,
  [SupportedChains.linea]: linea.assets,
  [SupportedChains.ethereum]: ethereum.assets,
  [SupportedChains.zkevm]: zkevm.assets,
  [SupportedChains.mode]: mode.assets
};

export function withPools<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class IonicPools extends Base {
    async fetchPoolData(poolId: string, overrides: CallOverrides = {}): Promise<IonicPoolData | null> {
      console.log("this.contracts: ", this.contracts);
      const {
        comptroller,
        name: _unfiliteredName,
        creator,
        blockPosted,
        timestampPosted
      } = await this.contracts.PoolDirectory.callStatic.pools(Number(poolId), overrides);
      if (comptroller === constants.AddressZero) {
        return null;
      }
      const name = filterPoolName(_unfiliteredName);

      const assets: NativePricedIonicAsset[] = (
        await this.contracts.PoolLens.callStatic.getPoolAssetsWithData(comptroller, overrides)
      ).map(filterOnlyObjectProperties);

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

        asset.netSupplyBalance = asset.supplyBalance.gt(asset.borrowBalance)
          ? asset.supplyBalance.sub(asset.borrowBalance)
          : constants.Zero;
        asset.netSupplyBalanceNative =
          Number(utils.formatUnits(asset.netSupplyBalance, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        asset.supplyBalanceNative =
          Number(utils.formatUnits(asset.supplyBalance, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        asset.borrowBalanceNative =
          Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)) *
          Number(utils.formatUnits(asset.underlyingPrice, 18));

        if (asset.membership) {
          totalCollateralSupplyBalanceNative += asset.supplyBalanceNative;
        }
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
        totalCollateralSupplyBalanceNative,
        totalBorrowBalanceNative,
        blockPosted,
        timestampPosted,
        underlyingTokens: assets.map((a) => a.underlyingToken),
        underlyingSymbols: assets.map((a) => a.underlyingSymbol),
        utilization
      };
    }

    async fetchPoolsManual(overrides: CallOverrides = {}): Promise<(IonicPoolData | null)[] | undefined> {
      const [poolIndexes, pools] = await this.contracts.PoolDirectory.callStatic.getActivePools(overrides);

      if (!pools.length || !poolIndexes.length) {
        return undefined;
      }

      const poolData = await Promise.all(
        poolIndexes.map((poolId) => {
          return this.fetchPoolData(poolId.toString(), overrides).catch((error) => {
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
      options: { from: string };
    }): Promise<IonicPoolData[]> {
      const isCreatedPools = filter === "created-pools";
      const isVerifiedPools = filter === "verified-pools";
      const isUnverifiedPools = filter === "unverified-pools";

      const req = isCreatedPools
        ? this.contracts.PoolLens.callStatic.getPoolsByAccountWithData(options.from)
        : isVerifiedPools
        ? this.contracts.PoolDirectory.callStatic.getPublicPoolsByVerification(true)
        : isUnverifiedPools
        ? this.contracts.PoolDirectory.callStatic.getPublicPoolsByVerification(false)
        : this.contracts.PoolLens.callStatic.getPublicPoolsWithData();

      const whitelistedPoolsRequest = this.contracts.PoolLens.callStatic.getWhitelistedPoolsByAccountWithData(
        options.from
      );

      const responses = await Promise.all([req, whitelistedPoolsRequest]);

      const [pools, whitelistedPools] = await Promise.all(
        responses.map(async (poolData) => {
          return await Promise.all(
            poolData[0].map((_id) => {
              return this.fetchPoolData(_id.toString());
            })
          );
        })
      );

      const whitelistedIds = whitelistedPools.map((pool) => pool?.id);
      const filteredPools = pools.filter((pool) => !whitelistedIds.includes(pool?.id));

      return [...filteredPools, ...whitelistedPools].filter((p) => !!p) as IonicPoolData[];
    }

    async isAuth(pool: string, market: string, role: Roles, user: string) {
      if (this.chainId === SupportedChains.neon) {
        return true;
      }

      const authRegistry = this.createAuthoritiesRegistry();
      const poolAuthAddress = await authRegistry.callStatic.poolsAuthorities(pool);

      if (poolAuthAddress === constants.AddressZero) {
        console.log(`Pool authority for pool ${pool} does not exist`);

        return false;
      }

      const poolAuth = this.createPoolRolesAuthority(poolAuthAddress);

      if (role === Roles.SUPPLIER_ROLE) {
        // let's check if it's public
        const cToken = this.createICErc20(market);
        const func = cToken.interface.getFunction("mint");
        const selectorHash = cToken.interface.getSighash(func);
        const isPublic = await poolAuth.callStatic.isCapabilityPublic(market, selectorHash);

        if (isPublic) {
          return true;
        }
      }

      return await poolAuth.callStatic.doesUserHaveRole(user, role);
    }

    async getHealthFactor(account: string, pool: string) {
      const poolLens = this.createPoolLens();
      const healthFactor = await poolLens.getHealthFactor(account, pool, { from: account });

      return healthFactor;
    }
  };
}
