import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import { Address, parseEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

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

        return netApy ? Number(utils.formatUnits(netApy)) * 100 : null;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!sdk && supplyApy !== undefined && !!amount && !!leverageRatio,
    staleTime: Infinity
  });
}
