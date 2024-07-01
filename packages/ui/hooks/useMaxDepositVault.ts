import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export function useMaxDepositVault(vault: Address) {
  const { currentSdk, address } = useMultiIonic();

  return useQuery(
    ['useMaxDepositVault', vault, currentSdk?.chainId, address],
    async () => {
      if (currentSdk && address && vault) {
        const maxDepositVault = await currentSdk
          .getMaxDepositVault(vault)
          .catch((e) => {
            console.warn(
              `Getting max deposit vault error: `,
              { chainId: currentSdk.chainId, vault },
              e
            );

            return null;
          });

        return maxDepositVault;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!vault && !!currentSdk,
      staleTime: Infinity
    }
  );
}
