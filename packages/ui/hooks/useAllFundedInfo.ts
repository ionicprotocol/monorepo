import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { assetSymbols, SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import { aprDays } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCrossFusePools } from '@ui/hooks/fuse/useCrossFusePools';
import { getAssetsClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';
import { UseAssetsData } from '@ui/hooks/useAssets';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { fetchRewards, UseRewardsData } from '@ui/hooks/useRewards';
import { MarketData } from '@ui/types/TokensDataMap';
import { getAnkrBNBContract } from '@ui/utils/contracts';
import { ChainSupportedAssets, getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export interface FundedAsset extends MarketData {
  chainId: string;
  poolId: string;
  poolName: string;
  comptroller: string;
  totalSupplyBalanceFiat: number;
  totalBorrowBalanceFiat: number;
  totalSupplyBalanceNative: number;
  totalBorrowBalanceNative: number;
}

export interface resQuery {
  fundedAssets: FundedAsset[];
  allClaimableRewards: {
    [key: string]: FlywheelClaimableRewards[];
  };
  rewards: UseRewardsData;
  totalSupplyAPYs: { [market: string]: number };
  borrowAPYs: { [market: string]: number };
}

export function useAllFundedInfo() {
  const enabledChains = useEnabledChains();
  const { poolsPerChain } = useCrossFusePools([...enabledChains]);
  const { getSdk, address } = useMultiMidas();

  return useQuery<resQuery | null>(
    [
      'useAllFundedInfo',
      enabledChains,
      Object.values(poolsPerChain).map((query) => query.data),
      address,
    ],
    async () => {
      if (poolsPerChain && enabledChains.length > 0) {
        const fundedAssets: FundedAsset[] = [];
        let allClaimableRewards: {
          [key: string]: FlywheelClaimableRewards[];
        } = {};
        let assetInfos: UseAssetsData = {};
        const totalSupplyAPYs: { [market: string]: number } = {};
        const borrowAPYs: { [market: string]: number } = {};
        const rewards: UseRewardsData = {};

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
                    // get assets which user funded
                    const assets = pool.assets.filter(
                      (asset) => asset.supplyBalanceFiat > 0 || asset.borrowBalanceFiat > 0
                    );

                    if (assets.length > 0) {
                      assets.map((asset) => {
                        fundedAssets.push({
                          ...asset,
                          poolId: pool.id.toString(),
                          comptroller: pool.comptroller,
                          poolName: pool.name,
                          totalSupplyBalanceFiat: pool.totalSupplyBalanceFiat,
                          totalBorrowBalanceFiat: pool.totalBorrowBalanceFiat,
                          totalSupplyBalanceNative: pool.totalSupplyBalanceNative,
                          totalBorrowBalanceNative: pool.totalBorrowBalanceNative,
                          chainId,
                        });
                      });

                      //get rewards
                      const rewards = await fetchRewards(
                        pool.comptroller,
                        assets,
                        Number(chainId),
                        sdk
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
                        let marketTotalAPY =
                          sdk.ratePerBlockToAPY(
                            asset.supplyRatePerBlock,
                            getBlockTimePerMinuteByChainId(Number(chainId))
                          ) / 100;

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

                        totalSupplyAPYs[asset.cToken] = marketTotalAPY;
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

        return { fundedAssets, allClaimableRewards, rewards, totalSupplyAPYs, borrowAPYs };
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: enabledChains.length > 0 && !!poolsPerChain,
    }
  );
}
