import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

import type { Address } from 'viem';

export const useOracle = (
  underlyingAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useOracle', underlyingAddress, sdk?.chainId],

    queryFn: async () => {
      if (underlyingAddress && sdk) {
        try {
          const mpo = sdk.createMasterPriceOracle(
            sdk.publicClient,
            sdk.walletClient as any
          );
          const oracle = await mpo.read.oracles([underlyingAddress]);

          return oracle;
        } catch (e) {
          console.warn(
            `Getting oracle error: `,
            { poolChainId, underlyingAddress },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!underlyingAddress && !!sdk
  });
};
