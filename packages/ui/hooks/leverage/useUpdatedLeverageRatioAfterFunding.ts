import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useUpdatedLeverageRatioAfterFunding(
  positionAddress: string,
  amount: BigNumber | null | undefined,
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

        return ratio ? Number(utils.formatUnits(ratio)) : null;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!sdk && !!amount && !!positionAddress,
    staleTime: Infinity
  });
}
