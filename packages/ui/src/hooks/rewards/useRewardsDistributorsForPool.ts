import { Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export interface RewardsDistributor {
  address: string;
  rewardToken: string;
  admin: string;
}

export const useRewardsDistributorsForPool = (comptrollerAddress?: string) => {
  const { fuse, currentChain } = useRari();

  const queryResult = useQuery(
    ['RewardsDistributorsForPool', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return [];
      const comptroller = createComptroller(comptrollerAddress, fuse);

      const rewardsDistributors: string[] = await comptroller.callStatic.getRewardsDistributors();

      if (!rewardsDistributors.length) return [];

      const distributors: RewardsDistributor[] = await Promise.all(
        rewardsDistributors.map(async (addr) => {
          const distributor = new Contract(
            addr,
            fuse.chainDeployment.RewardsDistributorDelegate.abi,
            fuse.provider.getSigner()
          );

          return {
            address: addr,
            rewardToken: await distributor.callStatic.rewardToken(),
            admin: await distributor.callStatic.admin(),
          };
        })
      );

      return distributors;
    },
    {
      enabled: !!comptrollerAddress,
    }
  );
  return queryResult;
};
