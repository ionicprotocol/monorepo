import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export function useMaxDepositVault(vault: string) {
  const { currentSdk, address } = useMultiMidas();

  return useQuery(
    ['useMaxDepositVault', vault, currentSdk?.chainId, address],
    async () => {
      if (currentSdk && address && vault) {
        const maxDepositVault = await currentSdk.getMaxDepositVault(vault).catch((e) => {
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
      staleTime: Infinity,
    }
  );
}
