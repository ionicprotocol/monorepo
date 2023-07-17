import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export function useMaxWithdrawAmount(asset: NativePricedIonicAsset, chainId: number) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery(
    ['useMaxWithdrawAmount', asset.cToken, sdk?.chainId, address],
    async () => {
      if (sdk && address) {
        const maxRedeem = await sdk.contracts.PoolLensSecondary.callStatic
          .getMaxRedeem(address, asset.cToken, { from: address })
          .catch((e) => {
            console.warn(`Getting max withdraw amount error: `, { asset, chainId }, e);

            return null;
          });

        return maxRedeem;
      } else {
        return null;
      }
    },
    {
      enabled: !!address && !!asset && !!sdk,
    }
  );
}
