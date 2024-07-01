import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useEquityAmount(position: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useEquityAmount', sdk?.chainId, position],

    queryFn: async () => {
      if (sdk) {
        const baseCollateral = await sdk
          .getEquityAmount(position)
          .catch((e) => {
            console.warn(
              `Getting base collateral error: `,
              { chainId, position },
              e
            );

            return null;
          });

        return baseCollateral;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!sdk,
    staleTime: Infinity
  });
}
