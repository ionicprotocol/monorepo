import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxRepayAmount(asset: NativePricedFuseAsset, chainId: number) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  return useQuery(
    ['useMaxRepayAmount', asset.underlyingToken, asset.borrowBalance, sdk?.chainId, address],
    async () => {
      if (sdk && address) {
        const balance = await fetchTokenBalance(asset.underlyingToken, sdk, address);
        const debt = asset.borrowBalance;

        return balance.gt(debt) ? debt : balance;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!asset && !!sdk,
      staleTime: Infinity,
    }
  );
}
