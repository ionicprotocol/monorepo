import type { FlywheelRewardsInfoForVault, SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useClaimableRewardsForVaults = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  return useQuery<FlywheelRewardsInfoForVault[] | null | undefined>(
    ['useClaimableRewardsForVaults', address],
    async () => {
      const res: FlywheelRewardsInfoForVault[] = [];

      await Promise.all(
        chainIds.map(async (chainId) => {
          const sdk = getSdk(Number(chainId));

          if (sdk && address) {
            const rewardsOfChain = await sdk.getClaimableRewardsForVaults(address);

            res.push(...rewardsOfChain);
          }
        })
      );

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!address,
      staleTime: Infinity,
    }
  );
};
