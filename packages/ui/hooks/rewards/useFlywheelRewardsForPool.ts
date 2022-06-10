import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { useRari } from '@ui/context/RariContext';

export const useFlywheelRewardsForPool = (poolAddress?: string) => {
  const {
    fuse,
    currentChain: { id },
  } = useRari();
  const { data: accountData } = useAccount();

  return useQuery(
    ['useFlywheelRewardsForPool', id, poolAddress],
    async () => {
      if (!accountData?.address || !poolAddress) return undefined;
      try {
        // Try with APRs first
        const result = await fuse.getFlywheelMarketRewardsByPoolWithAPR(poolAddress, {
          from: accountData.address,
        });
        return result;
      } catch (error) {
        console.warn(`Unable to get Rewards with APRs for ${poolAddress}`, error);
        // Fallback to rewards without APRs
        return fuse.getFlywheelMarketRewardsByPool(poolAddress, {
          from: accountData.address,
        });
      }
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
