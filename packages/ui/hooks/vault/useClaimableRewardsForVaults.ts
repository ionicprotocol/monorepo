import type {
  FlywheelRewardsInfoForVault,
  SupportedChains
} from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useClaimableRewardsForVaults = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();

  return useQuery({
    queryKey: ['useClaimableRewardsForVaults', address],

    queryFn: async () => {
      const res: FlywheelRewardsInfoForVault[] = [];

      await Promise.all(
        chainIds.map(async (chainId) => {
          const sdk = getSdk(Number(chainId));

          if (sdk && address) {
            const rewardsOfChain = await sdk
              .getClaimableRewardsForVaults(address)
              .catch((e) => {
                console.warn(
                  `Getting claimable rewards for vaults error: `,
                  { chainId },
                  e
                );

                return [] as FlywheelRewardsInfoForVault[];
              });

            res.push(...rewardsOfChain);
          }
        })
      );

      return res;
    },

    gcTime: Infinity,
    enabled: !!address,
    staleTime: Infinity
  });
};
