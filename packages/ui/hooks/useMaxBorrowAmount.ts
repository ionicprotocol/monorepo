import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/fuse/useBorrowCapsDataForAsset';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxBorrowAmount(
  asset: NativePricedFuseAsset,
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);
  const { data: borrowCapsDataForAsset } = useBorrowCapsDataForAsset(asset.cToken, chainId);

  return useQuery(
    [
      'useMaxBorrowAmount',
      asset.cToken,
      comptrollerAddress,
      sdk?.chainId,
      address,
      borrowCapsDataForAsset?.nonWhitelistedTotalBorrows,
    ],
    async () => {
      if (sdk && address && borrowCapsDataForAsset?.nonWhitelistedTotalBorrows) {
        try {
          const maxBorrow = (await sdk.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
            address,
            asset.cToken
          )) as BigNumber;

          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [borrowCap, isWhitelisted] = await Promise.all([
            comptroller.callStatic.borrowCaps(asset.cToken),
            comptroller.callStatic.isBorrowCapWhitelisted(asset.cToken, address),
          ]);

          let bigNumber: BigNumber;

          // if address isn't in borrw cap whitelist and asset has borrow cap
          if (!isWhitelisted && borrowCap.gt(constants.Zero)) {
            const availableCap = borrowCap.sub(borrowCapsDataForAsset.nonWhitelistedTotalBorrows);

            if (availableCap.lte(maxBorrow)) {
              bigNumber = availableCap;
            } else {
              bigNumber = maxBorrow;
            }
          } else {
            bigNumber = maxBorrow;
          }

          return {
            bigNumber: bigNumber,
            number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals)),
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
    {
      enabled:
        !!address &&
        !!asset &&
        !!sdk &&
        !!comptrollerAddress &&
        !!borrowCapsDataForAsset?.nonWhitelistedTotalBorrows,
    }
  );
}
