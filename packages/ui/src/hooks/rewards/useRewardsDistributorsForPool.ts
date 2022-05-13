import { RewardsDistributorDelegate } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/RewardsDistributorDelegate';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { RewardsDistributor } from '@ui/types/ComponentPropsType';

export const useRewardsDistributorsForPool = (comptrollerAddress?: string) => {
  const { fuse, currentChain } = useRari();

  const queryResult = useQuery(
    ['RewardsDistributorsForPool', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return [];

      const rewardsDistributors: RewardsDistributorDelegate[] =
        await fuse.getRewardsDistributorsByPool(comptrollerAddress, {
          from: await fuse.provider.getSigner().getAddress(),
        });

      if (!rewardsDistributors.length) return [];

      const distributors: RewardsDistributor[] = await Promise.all(
        rewardsDistributors.map(async (distributor) => {
          return {
            address: distributor.address,
            rewardToken: await distributor.callStatic.rewardToken(),
            admin: await distributor.callStatic.admin(),
          };
        })
      );

      return distributors;
    },
    {
      enabled: !!comptrollerAddress && !!currentChain,
    }
  );
  return queryResult;
};
