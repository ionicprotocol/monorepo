import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxWithdrawAmount(
  asset: NativePricedIonicAsset,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery(
    ['useMaxWithdrawAmount', asset.cToken, sdk?.chainId, address],
    async () => {
      if (sdk && address) {
        const maxRedeem = await sdk.contracts.PoolLensSecondary.simulate
          .getMaxRedeem([address, asset.cToken], { account: address })
          .catch((e) => {
            console.warn(
              `Getting max withdraw amount error: `,
              { asset, chainId },
              e
            );

            return null;
          })
          .then((result) => result?.result);

        return maxRedeem;
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
