import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { Address, formatEther } from 'viem';

export function useUpdatedNetApyAfterFunding(
  positionAddress: Address,
  amount: bigint | null | undefined,
  supplyApy?: bigint,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useUpdatedNetApyAfterFunding',
      positionAddress,
      supplyApy,
      amount,
      sdk?.chainId
    ],
    async () => {
      if (sdk && supplyApy !== undefined && amount && positionAddress) {
        const netApy = await sdk
          .getNetApyForPositionAfterFunding(positionAddress, supplyApy, amount)
          .catch((e) => {
            console.warn(
              `Getting updated net apy error: `,
              {
                amount,
                chainId,
                positionAddress,
                supplyApy
              },
              e
            );

            return null;
          });

        return netApy ? Number(formatEther(netApy)) * 100 : null;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled:
        !!sdk && supplyApy !== undefined && !!amount && !!positionAddress,
      staleTime: Infinity
    }
  );
}
