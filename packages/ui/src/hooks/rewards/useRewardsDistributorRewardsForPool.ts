import { RewardsDistributorMarketReward } from 'sdk/dist/cjs/src/modules/RewardsDistributor';
import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { useRari } from '@ui/context/RariContext';

export const useRewardsDistributorRewardsForPool = (poolAddress?: string) => {
  const { fuse } = useRari();
  const { data: accountData } = useAccount();

  return useQuery<RewardsDistributorMarketReward[] | undefined>(
    ['useRewardsDistributorRewardsForPool', poolAddress, accountData?.address],
    async () => {
      if (!accountData?.address) return undefined;

      return poolAddress
        ? await fuse.getRewardsDistributorMarketRewardsByPool(poolAddress, {
            from: accountData.address,
          })
        : undefined;
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
