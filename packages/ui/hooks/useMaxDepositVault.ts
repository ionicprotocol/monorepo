import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export function useMaxDepositVault(vault: string) {
  const { currentSdk, address } = useMultiMidas();

  return useQuery(
    ['useMaxDepositVault', vault, currentSdk?.chainId, address],
    async () => {
      if (currentSdk && address && vault) {
        const maxDepositVault = await currentSdk.getMaxDepositVault(vault);

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
