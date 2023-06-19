import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export function useMaxWithdrawVault(vault: string) {
  const { currentSdk, address } = useMultiMidas();

  return useQuery(
    ['useMaxWithdrawVault', vault, currentSdk?.chainId, address],
    async () => {
      if (currentSdk && address && vault) {
        const maxWithdrawVault = await currentSdk.getMaxWithdrawVault(vault).catch((e) => {
          console.warn(
            `Getting max withdraw vault error: `,
            { address, chainId: currentSdk.chainId, vault },
            e
          );

          return null;
        });

        return maxWithdrawVault;
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
