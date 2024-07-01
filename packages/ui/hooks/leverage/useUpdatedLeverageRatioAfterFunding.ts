import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { Address, formatEther } from 'viem';

export function useUpdatedLeverageRatioAfterFunding(
  positionAddress: Address,
  amount: bigint | null | undefined,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useUpdatedLeverageRatioAfterFunding',
      positionAddress,
      amount,
      sdk?.chainId
    ],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!amount && !!positionAddress,
      staleTime: Infinity
    }
  );
}
