import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export const usePerformanceFee = (
  poolChainId: number,
  pluginAddress?: Address
) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['usePerformanceFee', pluginAddress, sdk?.chainId],

    queryFn: async () => {
      if (sdk && pluginAddress) {
        try {
          const pluginContract = sdk.getErc4626PluginInstance(pluginAddress);
          const performanceFee = await pluginContract.read.performanceFee();

          return Number(formatEther(performanceFee)) * 100;
        } catch (e) {
          console.warn(
            `Getting performance fee error: `,
            { pluginAddress, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!pluginAddress && !!sdk,
    staleTime: Infinity
  });
};
