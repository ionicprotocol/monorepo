import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { APYResult } from '@ui/types/ComponentPropsType';

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  const { currentChain } = useMultiMidas();

  return useQuery<APYResult>(
    ['useApy', currentChain, underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      if (currentChain) {
        return await fetch(
          `/api/apyData?chain=${
            currentChain.id
          }&underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}${
            rewardAddress ? `&rewardAddress=${rewardAddress}` : ''
          }`
        ).then((response) => {
          if (response.status === 200) return response.json();
          throw 'APY Response was not ok';
        });
      }
    },
    {
      enabled: !!underlyingAddress && !!pluginAddress && !!currentChain,
    }
  );
}
