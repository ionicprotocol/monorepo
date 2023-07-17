import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxRepayAmount(asset: NativePricedIonicAsset, chainId: number) {
  const { address } = useMultiIonic();
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
      enabled: !!address && !!asset && !!sdk,
    }
  );
}
