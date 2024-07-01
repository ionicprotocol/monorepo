import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useIRM = (cTokenAddress?: Address, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useIRM', cTokenAddress, sdk?.chainId],

    queryFn: async () => {
      if (cTokenAddress && sdk) {
        try {
          const cToken = sdk.createICErc20(cTokenAddress);

          const irm = await cToken.read.interestRateModel();

          return irm;
        } catch (e) {
          console.warn(
            `Getting IRM error: `,
            { cTokenAddress, poolChainId },
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
