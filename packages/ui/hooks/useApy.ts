import { useQuery } from 'react-query';

import { useRari } from '../context/RariContext';

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  const {
    currentChain: { id: currentChainId },
  } = useRari();
  return useQuery(
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
