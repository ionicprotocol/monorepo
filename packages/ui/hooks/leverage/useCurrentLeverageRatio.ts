import { useQuery } from '@tanstack/react-query';
import { Address, formatEther, formatUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useCurrentLeverageRatio(position: Address, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useCurrentLeverageRatio', sdk?.chainId, position],

    queryFn: async () => {
      if (sdk) {
        const currentLeverageRatio = await sdk
          .getCurrentLeverageRatio(position)
          .catch((e) => {
            console.warn(
              `Getting current leverage ratio error: `,
              { chainId, position },
              e
            );

            return null;
          });

        if (currentLeverageRatio) {
          return Number(formatEther(currentLeverageRatio));
        }

        return null;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!sdk && !!position,
    staleTime: Infinity
  });
}

export const useCurrentLeverageRatios = (positionAddresses: Address[]) => {
  const { currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!currentSdk,
    queryFn: async () => {
      if (!currentSdk) {
        return null;
      }

      const positionsLoopValues = await Promise.all(
        positionAddresses.map(async (positionAddress) =>
          currentSdk.getCurrentLeverageRatio(positionAddress)
        )
      );

      return positionsLoopValues.map((loopValue) =>
        Number(formatEther(loopValue))
      );
    },
    queryKey: ['positions', 'leverage', ...positionAddresses]
  });
};
