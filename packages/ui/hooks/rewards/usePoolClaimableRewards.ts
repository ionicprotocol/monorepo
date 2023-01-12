import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
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
    () => {
      const sdk = getSdk(poolChainId);

      if (sdk && address && poolChainId) {
        return sdk.getFlywheelClaimableRewardsForPool(poolAddress, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!poolChainId,
    }
  );
};
