import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useBorrowCapsForAssets } from './ionic/useBorrowCapsDataForAsset';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxBorrowAmounts(
  assets: NativePricedIonicAsset[],
  comptrollerAddress: string,
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
      address,
      borrowCapsDataForAssets?.nonWhitelistedTotalBorrows
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
            const maxBorrow =
              (await sdk.contracts.PoolLensSecondary.callStatic.getMaxBorrow(
                address,
                asset.cToken
              )) as BigNumber;

            const comptroller = sdk.createComptroller(comptrollerAddress);
            const [borrowCap, isWhitelisted] = await Promise.all([
              comptroller.callStatic.borrowCaps(asset.cToken),
              comptroller.callStatic.isBorrowCapWhitelisted(
                asset.cToken,
                address
              )
            ]);

            let bigNumber: BigNumber;

            // if address isn't in borrw cap whitelist and asset has borrow cap
            if (!isWhitelisted && borrowCap.gt(constants.Zero)) {
              const availableCap = borrowCap.sub(
                borrowCapsDataForAssets[asset.cToken].nonWhitelistedTotalBorrows
              );

              if (availableCap.lte(maxBorrow)) {
                bigNumber = availableCap;
              } else {
                bigNumber = maxBorrow;
              }
            } else {
              bigNumber = maxBorrow;
            }

            borrowCapsData.push({
              bigNumber: bigNumber,
              number: Number(
                utils.formatUnits(bigNumber, asset.underlyingDecimals)
              )
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
