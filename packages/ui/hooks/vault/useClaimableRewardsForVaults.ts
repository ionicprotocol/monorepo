import type { FlywheelRewardsInfoForVault } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useClaimableRewardsForVaults = ({ poolChainId }: { poolChainId: number }) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  return useQuery<FlywheelRewardsInfoForVault[] | null | undefined>(
    ['useClaimableRewardsForVaults', address, sdk?.chainId],
    async () => {
      if (sdk && address) {
        return await sdk.getClaimableRewardsForVaults(address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!sdk,
      staleTime: Infinity,
    }
  );
};
