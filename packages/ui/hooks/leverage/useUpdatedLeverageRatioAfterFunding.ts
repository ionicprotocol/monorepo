import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export function useUpdatedLeverageRatioAfterFunding(
  positionAddress: Address,
  amount: bigint | null | undefined,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: [
      'useUpdatedLeverageRatioAfterFunding',
      positionAddress,
      amount,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (sdk && amount && positionAddress) {
        const ratio = await sdk
          .getLeverageRatioAfterFunding(positionAddress, amount)
          .catch((e) => {
            console.warn(
              `Getting updated leverage ratio error: `,
              {
                amount,
                chainId,
                positionAddress
              },
              e
            );

            return null;
          });

        return ratio ? Number(formatEther(ratio)) : null;
      } else {
        return null;
      }
    },

    enabled: !!sdk && !!amount && !!positionAddress,
    staleTime: Infinity
  });
}
