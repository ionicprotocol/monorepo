import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { useBalance } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxRepayAmount(
  asset: NativePricedIonicAsset,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: balanceData } = useBalance({
    address: address,
    token: asset.underlyingToken as `0x${string}`
  });

  return useQuery({
    queryKey: [
      'useMaxRepayAmount',
      asset.underlyingToken,
      asset.borrowBalance,
      sdk?.chainId,
      address
    ],

    queryFn: async () => {
      if (sdk && address && balanceData) {
        const balance = balanceData.value;
        const debt = asset.borrowBalance;

        return balance > debt ? debt : balance;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!address && !!asset && !!sdk && !!balanceData,
    staleTime: Infinity
  });
}
