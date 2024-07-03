import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export function useMaxWithdrawVault(vault: string) {
  const { currentSdk, address } = useMultiIonic();

  return useQuery({
    queryKey: ['useMaxWithdrawVault', vault, currentSdk?.chainId, address],

    queryFn: async () => {
      if (currentSdk && address && vault) {
        const maxWithdrawVault = await currentSdk
          .getMaxWithdrawVault(vault)
          .catch((e) => {
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

    gcTime: Infinity,
    enabled: !!address && !!vault && !!currentSdk,
    staleTime: Infinity
  });
}
