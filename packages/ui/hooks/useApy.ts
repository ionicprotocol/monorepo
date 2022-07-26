import { useQuery } from 'react-query';

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  return useQuery(
    ['useApy', underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      return await fetch(
        `/api/apyData?underlyingAddress=${underlyingAddress}&pluginAddress=${pluginAddress}&rewardAddress=${
          rewardAddress || ''
        }`
      ).then((response) => {
        if (response.status === 200) return response.json();
        throw 'APY Response was not ok';
      });
    },
    {
      enabled: !!underlyingAddress && !!pluginAddress,
    }
  );
}
