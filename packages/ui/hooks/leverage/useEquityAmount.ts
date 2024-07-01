import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useEquityAmount(position: Address, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useEquityAmount', sdk?.chainId, position],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled: !!sdk,
      staleTime: Infinity
    }
  );
}
