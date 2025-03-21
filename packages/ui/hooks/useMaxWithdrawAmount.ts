import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { NativePricedIonicAsset } from '@ionicprotocol/types';

export function useMaxWithdrawAmount(
  asset: NativePricedIonicAsset,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: [
      'useMaxWithdrawAmount',
      asset.cToken,
      sdk?.chainId,
      address,
      asset.supplyBalance
    ],

    queryFn: async () => {
      // Special case for wUSDM - bypass restrictions
      if (asset.underlyingSymbol === 'wUSDM') {
        return asset.supplyBalance || 0n;
      }

      if (sdk && address) {
        const maxRedeem = await sdk.contracts.PoolLensSecondary.simulate
          .getMaxRedeem([address, asset.cToken], { account: address })
          .catch((e) => {
            console.warn(
              `Getting max withdraw amount error: `,
              { asset, chainId },
              e
            );

            // Fall back to asset supply balance for failed calls
            return { result: asset.supplyBalance || 0n };
          })
          .then((result) => result?.result);

        return maxRedeem;
      } else {
        return null;
      }
    },

    enabled: !!address && !!asset && !!sdk
  });
}
