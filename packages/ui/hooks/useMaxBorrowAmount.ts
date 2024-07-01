import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { Address, formatUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/fuse/useBorrowCapsDataForAsset';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxBorrowAmount(
  asset: NativePricedIonicAsset,
  comptrollerAddress: Address,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: borrowCapsDataForAsset } = useBorrowCapsDataForAsset(
    asset.cToken,
    chainId
  );

  return useQuery({
    queryKey: [
      'useMaxBorrowAmount',
      asset.cToken,
      comptrollerAddress,
      sdk?.chainId,
      address,
      borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
    ],

    queryFn: async () => {
      if (
        sdk &&
        address &&
        borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
      ) {
        try {
          const maxBorrow = (
            await sdk.contracts.PoolLensSecondary.simulate.getMaxBorrow(
              [address, asset.cToken],
              { account: sdk?.walletClient.account?.address }
            )
          ).result;

          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [borrowCap, isWhitelisted] = await Promise.all([
            comptroller.read.borrowCaps([asset.cToken]),
            comptroller.read.isBorrowCapWhitelisted([asset.cToken, address])
          ]);

          let bigNumber: bigint;

          // if address isn't in borrw cap whitelist and asset has borrow cap
          if (!isWhitelisted && borrowCap > 0n) {
            const availableCap =
              borrowCap - borrowCapsDataForAsset.nonWhitelistedTotalBorrows;

            if (availableCap <= maxBorrow) {
              bigNumber = availableCap;
            } else {
              bigNumber = maxBorrow;
            }
          } else {
            bigNumber = maxBorrow;
          }

          if (bigNumber < 0) {
            bigNumber = 0n;
          }

          // Limit the max borrow amount to 90%
          bigNumber = (bigNumber * 9n) / 10n;

          return {
            bigNumber: bigNumber,
            number: Number(formatUnits(bigNumber, asset.underlyingDecimals))
          };
        } catch (e) {
          console.warn(
            `Getting max borrow amount error: `,
            { address, cToken: asset.cToken, chainId, comptrollerAddress },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    gcTime: Infinity,

    enabled:
      !!address &&
      !!asset &&
      !!sdk &&
      !!comptrollerAddress &&
      !!borrowCapsDataForAsset?.nonWhitelistedTotalBorrows,

    staleTime: Infinity
  });
}
