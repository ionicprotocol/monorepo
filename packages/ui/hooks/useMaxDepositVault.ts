import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export function useMaxDepositVault(vault: string) {
  const { currentSdk, address } = useMultiIonic();

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
      enabled: !!address && !!vault && !!currentSdk
    }
  );
}
