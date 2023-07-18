import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import type { SupportedChains } from '@ionicprotocol/types';
import { assetSymbols } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import { aprDays } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCrossPools } from '@ui/hooks/ionic/useCrossPools';
import { getAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import type { UseAssetsData } from '@ui/hooks/useAssets';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import { fetchFlywheelRewards, fetchRewards } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getAnkrBNBContract } from '@ui/utils/contracts';
import { ChainSupportedAssets, getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export interface FundedAsset extends MarketData {
  chainId: string;
  comptroller: string;
  poolId: string;
  poolName: string;
  totalBorrowBalanceFiat: number;
  totalBorrowBalanceNative: number;
  totalCollateralSupplyBalanceNative: number;
  totalSupplyBalanceFiat: number;
  totalSupplyBalanceNative: number;
}

export interface resQuery {
  allClaimableRewards: {
    [key: string]: FlywheelClaimableRewards[];
  };
  borrowAPYs: { [market: string]: number };
  fundedAssets: FundedAsset[];
  rewards: UseRewardsData;
  totalBorrowBalanceFiat: number;
  totalBorrowBalanceNative: number;
  totalCollateralSupplyBalanceNative: number;
  totalSupplyAPYs: { [market: string]: { apy: number; totalApy: number } };
  totalSupplyBalanceFiat: number;
  totalSupplyBalanceNative: number;
}

export function useAllFundedInfo() {
  const enabledChains = useEnabledChains();
  const { poolsPerChain } = useCrossPools([...enabledChains]);
  const { getSdk, address } = useMultiIonic();

  return useQuery<resQuery | null>(
    [
      'useAllFundedInfo',
      enabledChains,
      Object.values(poolsPerChain).map((query) => query.data),
      address
    ],
    async () => {
      if (poolsPerChain && enabledChains.length > 0) {
        const fundedAssets: FundedAsset[] = [];
        let allClaimableRewards: {
          [key: string]: FlywheelClaimableRewards[];
        } = {};
        let assetInfos: UseAssetsData = {};
        const totalSupplyAPYs: { [market: string]: { apy: number; totalApy: number } } = {};
        const borrowAPYs: { [market: string]: number } = {};
        const rewards: UseRewardsData = {};

        let totalSupplyBalanceFiat = 0;
        let totalBorrowBalanceFiat = 0;
        let totalSupplyBalanceNative = 0;
        const totalCollateralSupplyBalanceNative = 0;
        let totalBorrowBalanceNative = 0;

        await Promise.all(
          Object.entries(poolsPerChain).map(async ([chainId, poolsQuery]) => {
            const sdk = getSdk(Number(chainId));

            const _assetInfos: UseAssetsData = await axios
              .get(`/api/assets?chainId=${chainId}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Unable to fetch assets of chain \`${chainId}\``, error);
                return {};
              });

            assetInfos = { ...assetInfos, ..._assetInfos };

            if (poolsQuery && poolsQuery.data && poolsQuery.data.length > 0) {
              await Promise.all(
                poolsQuery.data.map(async (pool) => {
                  // only calculate rewards for pools which user supplied or borrowed in
                  if (
                    address &&
                    sdk &&
                    (pool.totalSupplyBalanceFiat > 0 || pool.totalBorrowBalanceFiat > 0)
                  ) {
                    totalSupplyBalanceFiat += pool.totalSupplyBalanceFiat;
                    totalBorrowBalanceFiat += pool.totalBorrowBalanceFiat;
                    totalSupplyBalanceNative += pool.totalSupplyBalanceNative;
                    totalBorrowBalanceNative += pool.totalBorrowBalanceNative;
                    // get assets which user funded
                    const assets = pool.assets.filter(
                      (asset) => asset.supplyBalanceFiat > 0 || asset.borrowBalanceFiat > 0
                    );

                    if (assets.length > 0) {
                      assets.map((asset) => {
                        fundedAssets.push({
                          ...asset,
                          chainId,
                          comptroller: pool.comptroller,
                          poolId: pool.id.toString(),
                          poolName: pool.name,
                          totalBorrowBalanceFiat: pool.totalBorrowBalanceFiat,
                          totalBorrowBalanceNative: pool.totalBorrowBalanceNative,
                          totalCollateralSupplyBalanceNative:
                            pool.totalCollateralSupplyBalanceNative,
                          totalSupplyBalanceFiat: pool.totalSupplyBalanceFiat,
                          totalSupplyBalanceNative: pool.totalSupplyBalanceNative
                        });
                      });
                      const { flywheelRewardsWithAPY, flywheelRewardsWithoutAPY } =
                        await fetchFlywheelRewards(pool.comptroller, sdk);
                      //get rewards
                      const rewards = await fetchRewards(
                        assets,
                        Number(chainId),
                        flywheelRewardsWithAPY,
                        flywheelRewardsWithoutAPY
                      );

                      // get claimable rewards

                      const assetsClaimableRewards = await getAssetsClaimableRewards(
                        pool.comptroller,
                        assets.map((asset) => asset.cToken),
                        sdk,
                        address
                      );

                      allClaimableRewards = { ...allClaimableRewards, ...assetsClaimableRewards };

                      // get totalSupplyApys

                      let ankrBNBApr = 0;

                      const ankrAsset = ChainSupportedAssets[
                        Number(chainId) as SupportedChains
                      ].find((asset) => asset.symbol === assetSymbols.ankrBNB);

                      const isEnabled = !!assets.find(
                        (asset) => asset.underlyingSymbol === assetSymbols.ankrBNB
                      );

                      if (ankrAsset && isEnabled) {
                        const contract = getAnkrBNBContract(sdk);
                        const apr = await contract.callStatic.averagePercentageRate(
                          ankrAsset.underlying,
                          aprDays
                        );

                        ankrBNBApr = Number(utils.formatUnits(apr));
                      }

                      for (const asset of assets) {
                        const apy =
                          sdk.ratePerBlockToAPY(
                            asset.supplyRatePerBlock,
                            getBlockTimePerMinuteByChainId(Number(chainId))
                          ) / 100;

                        let marketTotalAPY = apy;

                        if (asset.underlyingSymbol === assetSymbols.ankrBNB && ankrBNBApr) {
                          marketTotalAPY += Number(ankrBNBApr) / 100;
                        }

                        if (rewards && rewards[asset.cToken]) {
                          marketTotalAPY += rewards[asset.cToken].reduce(
                            (acc, cur) => (cur.apy ? acc + cur.apy : acc),
                            0
                          );
                        }

                        if (assetInfos && assetInfos[asset.underlyingToken.toLowerCase()]) {
                          assetInfos[asset.underlyingToken.toLowerCase()].map((reward) => {
                            if (reward.apy) marketTotalAPY += reward.apy;
                          });
                        }

                        totalSupplyAPYs[asset.cToken] = { apy, totalApy: marketTotalAPY };
                      }

                      // get borrowAPYs

                      for (const asset of assets) {
                        const marketBorrowApy =
                          sdk.ratePerBlockToAPY(
                            asset.borrowRatePerBlock,
                            getBlockTimePerMinuteByChainId(Number(chainId))
                          ) / 100;

                        borrowAPYs[asset.cToken] = marketBorrowApy;
                      }
                    }
                  }
                })
              );
            }
          })
        );

        return {
          allClaimableRewards,
          borrowAPYs,
          fundedAssets,
          rewards,
          totalBorrowBalanceFiat,
          totalBorrowBalanceNative,
          totalCollateralSupplyBalanceNative,
          totalSupplyAPYs,
          totalSupplyBalanceFiat,
          totalSupplyBalanceNative
        };
      }

      return null;
    },
    {
      enabled: enabledChains.length > 0 && !!poolsPerChain
    }
  );
}
