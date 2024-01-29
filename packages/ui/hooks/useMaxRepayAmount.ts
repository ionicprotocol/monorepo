import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useBalance } from 'wagmi';

export function useMaxRepayAmount(
  asset: NativePricedIonicAsset,
  chainId: number
) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);
  const { data: balanceData } = useBalance({
    address: address as any,
    token: asset.underlyingToken as any
  });

  return useQuery(
    [
      'useMaxRepayAmount',
      asset.underlyingToken,
      asset.borrowBalance,
      sdk?.chainId,
      address
    ],
    async () => {
      if (sdk && address && balanceData) {
        const balance = balanceData.value;
        const debt = asset.borrowBalance;

        return balance.gt(debt) ? debt : balance;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!asset && !!sdk,
      staleTime: Infinity
    }
  );
}
