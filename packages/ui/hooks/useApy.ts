import axios from 'axios';
import { useQuery } from 'react-query';

export function useApy(underlyingAddress: string, pluginAddress: string, rewardAddress?: string) {
  return useQuery(
    ['useApy', underlyingAddress, pluginAddress, rewardAddress],
    async () => {
      const apy = await axios.get(
        `/api/apyData?underlyingAddress=${underlyingAddress}&&pluginAddress=${pluginAddress}&&rewardAddress=${rewardAddress}`
      );

      return apy.data;
    },
    {
      enabled: !!underlyingAddress && !!pluginAddress,
    }
  );
}
