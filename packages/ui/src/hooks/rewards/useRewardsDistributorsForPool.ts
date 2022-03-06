import { Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export interface RewardsDistributor {
  address: string;
  rewardToken: string;
  admin: string;
}

export const useRewardsDistributorsForPool = (
  comptrollerAddress?: string
): RewardsDistributor[] => {
  const { fuse } = useRari();

  const { data, error } = useQuery(comptrollerAddress + ' rewardsDistributors', async () => {
    if (!comptrollerAddress) return [];
    const comptroller = createComptroller(comptrollerAddress, fuse);

    const rewardsDistributors: string[] = await comptroller.callStatic.getRewardsDistributors();

    if (!rewardsDistributors.length) return [];

    const distributors: RewardsDistributor[] = await Promise.all(
      rewardsDistributors.map(async (addr) => {
        const distributor = new Contract(
          addr,
          fuse.chainDeployment.Comptroller.abi,
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
  });
  return data ?? [];
};
