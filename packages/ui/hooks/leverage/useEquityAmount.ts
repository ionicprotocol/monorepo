import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export function useEquityAmount(position: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useEquityAmount', sdk?.chainId, position],
    async () => {
      if (sdk) {
        const baseCollateral = await sdk.getEquityAmount(position).catch((e) => {
          console.warn(`Getting base collateral error: `, { chainId, position }, e);

          return null;
        });

        return baseCollateral;
      } else {
        return null;
      }
    },
    {
      enabled: !!sdk && !!position,
    }
  );
}
