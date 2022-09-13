import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';
import { APYResult } from '@ui/types/ComponentPropsType';

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  const {
    currentChain: { id: currentChainId },
  } = useMidas();
  return useQuery<APYResult>(
    ['useApy', currentChainId, underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      return await fetch(
        `/api/apyData?chain=${currentChainId}&underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}${
          rewardAddress ? `&rewardAddress=${rewardAddress}` : ''
        }`
      ).then((response) => {
        if (response.status === 200) return response.json();
        throw 'APY Response was not ok';
      });
    },
    {
      enabled: !!underlyingAddress && !!pluginAddress && !!currentChainId,
    }
  );
}
