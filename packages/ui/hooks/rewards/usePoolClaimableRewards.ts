import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const usePoolClaimableRewards = ({
  poolAddress,
  poolChainId,
}: {
  poolAddress: string;
  poolChainId: number;
}) => {
  const { getSdk, address } = useMultiMidas();

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['usePoolClaimableRewards', poolAddress, address, poolChainId],
    async () => {
      const sdk = getSdk(poolChainId);

      if (sdk && address && poolChainId) {
        return await sdk.getFlywheelClaimableRewardsForPool(poolAddress, address).catch((e) => {
          console.warn(
            `Getting flywheel claimable rewards for pool error: `,
            { address, poolAddress, poolChainId },
            e
          );

          return null;
        });
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!poolAddress && !!address && !!poolChainId,
      staleTime: Infinity,
    }
  );
};
