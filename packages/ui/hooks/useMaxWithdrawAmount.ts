import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useFusePoolData } from './useFusePoolData';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxWithdrawAmount(
  asset: NativePricedIonicAsset,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: poolData } = useFusePoolData('0', chainId);

  return useQuery(
    ['useMaxWithdrawAmount', asset.cToken, sdk?.chainId, address],
    async () => {
      if (sdk && address && poolData) {
        const maxRedeem = await sdk.contracts.PoolLensSecondary.callStatic
          .getMaxRedeem(address, asset.cToken, { from: address })
          .catch((e) => {
            console.warn(
              `Getting max withdraw amount error: `,
              { asset, chainId },
              e
            );

            return null;
          });

        // Limit the max withdraw amount to 90%
        // if the user has borrows
        return !!poolData.totalBorrowBalanceFiat
          ? maxRedeem?.mul(9).div(10)
          : maxRedeem;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!asset && !!sdk && !!poolData,
      staleTime: Infinity
    }
  );
}
