import { useRari } from '@context/RariContext';
import { useIncentivesWithRates } from '@hooks/rewards/useRewardAPY';
import { useTokensDataAsMap } from '@hooks/useTokenData';
import {
  CTokenIncentivesMap,
  CTokenRewardsDistributorIncentives,
  CTokensUnderlyingMap,
  IncentivesData,
  RewardsDistributorCTokensMap,
} from '@type/ComponentPropsType';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

export function usePoolIncentives(comptroller?: string): IncentivesData {
  const { fuse, currentChain } = useRari();

  // 1. Make Call to FusePoolLens
  const { data } = useQuery(['PoolIncentives', currentChain.id, comptroller], async () => {
    if (!comptroller) return [];

    return await fuse.contracts.FusePoolLensSecondary.callStatic.getRewardSpeedsByPool(comptroller);
  });

  // 2. Destructure data from Contract call
  const cTokens: string[] = data?.[0] ?? [];
  const rewardsDistributors: string[] = data?.[1] ?? [];
  const rewardTokens: string[] = data?.[2] ?? [];
  const supplySpeeds: BigNumber[][] = data?.[3] ?? [];
  const borrowSpeeds: BigNumber[][] = data?.[4] ?? [];

  const rewardTokensData = useTokensDataAsMap(rewardTokens);

  // 3. Iterate through data
  ////  rewardsDistributors & rewardTokens are ordered by matching indexes
  ////  supplySpeeds/borrowSpeeds is a 2d array where the first level is ordered by matching indices with `cTokens`, and each nested array has matching indices with `rewardDistributors`;
  const [incentives, rewardsDistributorCtokens]: [
    CTokenIncentivesMap,
    RewardsDistributorCTokensMap
  ] = useMemo(() => {
    const poolIncentives: CTokenIncentivesMap = {};
    const rewardsDistributorCTokensMap: RewardsDistributorCTokensMap = {};

    // Loop through the data and construct the final object
    for (let i = 0; i < cTokens.length; i++) {
      // i contains the index of the current cToken
      const cTokenAddress = cTokens[i];
      const distributorSupplySpeedsForCToken: BigNumber[] = supplySpeeds[i]; //this a 1d array of
      const distributorBorrowSpeedsForCToken: BigNumber[] = borrowSpeeds[i];

      for (let j = 0; j < distributorBorrowSpeedsForCToken.length; j++) {
        // j contains the index of the current rewardsDistributor.
        // Even if a cToken has no RewardsDistributor assigned to it, there will still be a value in this array for it. We will handle this discrepancy below
        const rewardsDistributorAddress = rewardsDistributors[j];
        const rewardToken = rewardTokens[j];
        const supplySpeed = parseFloat(distributorSupplySpeedsForCToken[j].toString());
        const borrowSpeed = parseFloat(distributorBorrowSpeedsForCToken[j].toString());

        const obj: CTokenRewardsDistributorIncentives = {
          supplySpeed,
          borrowSpeed,
          rewardToken,
          rewardsDistributorAddress,
        };

        // if a cToken has no supply or borrow speed set, skip adding it
        if (supplySpeed || borrowSpeed) {
          if (!poolIncentives[cTokenAddress]) {
            // Update the Mapping of CToken => CTokenRewardsDistributorIncentives[]
            poolIncentives[cTokenAddress] = [obj];
          } else poolIncentives[cTokenAddress].push(obj);

          //   Update the map of rewardsDistributorAddress => CToken[]
          if (!rewardsDistributorCTokensMap[rewardsDistributorAddress]) {
            rewardsDistributorCTokensMap[rewardsDistributorAddress] = [cTokenAddress];
          } else rewardsDistributorCTokensMap[rewardsDistributorAddress].push(cTokenAddress);
        }
      }
    }

    return [poolIncentives, rewardsDistributorCTokensMap];
  }, [cTokens, rewardsDistributors, rewardTokens, supplySpeeds, borrowSpeeds]);

  const hasIncentives = useMemo(() => !!Object.keys(incentives).length, [incentives]);

  const incentivesWithRates = useIncentivesWithRates(incentives, rewardTokens, comptroller!);

  return {
    hasIncentives,
    incentives: incentivesWithRates,
    rewardTokensData,
    rewardsDistributorCtokens,
  };
}

export const useCTokensUnderlying = (cTokenAddresses: string[]): CTokensUnderlyingMap => {
  const { fuse, currentChain } = useRari();

  const { data: cTokensUnderlying } = useQuery(
    ['CTokensUnderlying', currentChain.id, cTokenAddresses?.join(',')],
    async () => {
      const _map: CTokensUnderlyingMap = {};
      if (cTokenAddresses && cTokenAddresses.length) {
        await Promise.all(
          cTokenAddresses.map(async (cTokenAddress) => {
            const cTokenInstance = fuse.createCToken(cTokenAddress);
            _map[cTokenAddress] = await cTokenInstance.callStatic.underlying();
          })
        );
      }

      return _map;
    }
  );

  return cTokensUnderlying ?? {};
};
