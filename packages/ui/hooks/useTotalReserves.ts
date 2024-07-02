import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';
import { Address } from 'viem';

export const useTotalReserves = (cTokenAddress?: Address, chainId?: number) => {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useTotalReserves', cTokenAddress, sdk?.chainId],

    queryFn: async () => {
      if (cTokenAddress && sdk) {
        try {
          const cToken = sdk.createICErc20(cTokenAddress);
          const [totalReserves] = await Promise.all([
            cToken.read.totalReserves()
          ]);

          return totalReserves;
        } catch (e) {
          console.warn(
            `Getting total reserves data error: `,
            { cTokenAddress, chainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!cTokenAddress && !!sdk
  });
};
