import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { useRari } from '@ui/context/RariContext';

export const useFlywheelRewardsForPool = (poolAddress?: string) => {
  const {
    fuse,
    currentChain: { id: chainId },
  } = useRari();
  const { data: accountData } = useAccount();

  return useQuery(
    ['useFlywheelRewardsForPool', chainId, poolAddress],
    async () => {
      if (!accountData?.address || !poolAddress) return undefined;
      return fuse.getFlywheelMarketRewardsByPool(poolAddress, {
        from: accountData.address,
      });
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
