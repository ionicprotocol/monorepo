import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { Address, formatUnits } from 'viem';

import { useBorrowCapsForAssets } from './ionic/useBorrowCapsDataForAsset';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxBorrowAmounts(
  assets: NativePricedIonicAsset[],
  comptrollerAddress: Address,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const cTokenAddresses = assets.map((asset) => asset.cToken);
  const { data: borrowCapsDataForAssets } = useBorrowCapsForAssets(
    cTokenAddresses,
    chainId
  );

  return useQuery(
    [
      'useMaxBorrowAmount',
      ...cTokenAddresses,
      comptrollerAddress,
      sdk?.chainId,
      address
    ],
    async () => {
      if (sdk && address && borrowCapsDataForAssets) {
        const borrowCapsData = [];

        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];

          if (
            !borrowCapsDataForAssets[asset.cToken]?.nonWhitelistedTotalBorrows
          ) {
            borrowCapsData.push(null);

            continue;
          }

          try {
            const maxBorrow = (
              await sdk.contracts.PoolLensSecondary.simulate.getMaxBorrow([
                address,
                asset.cToken
              ])
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
                borrowCap -
                borrowCapsDataForAssets[asset.cToken]
                  .nonWhitelistedTotalBorrows;

              if (availableCap <= maxBorrow) {
                bigNumber = availableCap;
              } else {
                bigNumber = maxBorrow;
              }
            } else {
              bigNumber = maxBorrow;
            }

            borrowCapsData.push({
              bigNumber: bigNumber,
              number: Number(formatUnits(bigNumber, asset.underlyingDecimals))
            });
          } catch (e) {
            console.warn(
              `Getting max borrow amount error: `,
              { address, cToken: asset.cToken, chainId, comptrollerAddress },
              e
            );

            borrowCapsData.push(null);
          }
        }

        return borrowCapsData;
      }

      return [];
    },
    {
      cacheTime: Infinity,
      enabled:
        !!address &&
        !!assets &&
        !!sdk &&
        !!comptrollerAddress &&
        !!borrowCapsDataForAssets,
      staleTime: Infinity
    }
  );
}
