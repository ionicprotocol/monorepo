import { useQuery } from '@tanstack/react-query';
import { formatEther, parseEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export function useGetNetApy(
  collateralMarket: Address,
  borrowableMarket: Address,
  amount: bigint | null | undefined,
  leverageRatio: number | null | undefined,
  supplyApy?: bigint,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: [
      'useGetNetApy',
      supplyApy,
      amount,
      collateralMarket,
      borrowableMarket,
      leverageRatio,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (sdk && supplyApy !== undefined && amount && leverageRatio) {
        const netApy = await sdk
          .getNetAPY(
            supplyApy,
            amount,
            collateralMarket,
            borrowableMarket,
            parseEther(leverageRatio.toString())
          )
          .catch((e) => {
            console.warn(
              `Getting net apy error: `,
              {
                amount,
                borrowableMarket,
                collateralMarket,
                leverageRatio,
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

    enabled: !!sdk && supplyApy !== undefined && !!amount && !!leverageRatio,
    staleTime: Infinity
  });
}
