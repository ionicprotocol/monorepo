import { useQuery } from '@tanstack/react-query';

import { APYResult } from '@ui/types/ComponentPropsType';

export function useApy(
  underlyingAddress: string,
  pluginAddress: string,
  rewardAddress?: string,
  poolChainId?: number
) {
  return useQuery<APYResult>(
    ['useApy', poolChainId, underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      if (poolChainId) {
        return await fetch(
          `/api/apyData?chain=${poolChainId}&underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}${
            rewardAddress ? `&rewardAddress=${rewardAddress}` : ''
          }`
        ).then((response) => {
          if (response.status === 200) return response.json();
          throw 'APY Response was not ok';
        });
      }
    },
    {
      enabled: !!underlyingAddress && !!pluginAddress && !!poolChainId,
    }
  );
}
