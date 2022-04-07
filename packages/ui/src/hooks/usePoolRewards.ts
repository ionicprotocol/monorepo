import { MarketReward } from '@midas-capital/sdk/dist/cjs/src/modules/RewardsDistributor';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';

export const usePoolRewards = (comptroller: string | undefined) => {
  const { fuse, address } = useRari();

  const queryResult = useQuery<MarketReward[] | undefined>(
    ['usePoolRewards', comptroller, address],
    async () => {
      return comptroller
        ? await fuse.getRewardsDistributorMarketRewardsByPool(comptroller, {
            from: address,
          })
        : undefined;
    }
  );

  return queryResult;
};
