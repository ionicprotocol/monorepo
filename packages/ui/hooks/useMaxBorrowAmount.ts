import type { IonicSdk } from '@ionicprotocol/sdk';
import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import {
  useBorrowCapsDataForAsset,
  useBorrowCapsForAssets
} from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export interface CTokenToMaxBorrow {
  [cToken: string]: {
    bigNumber: BigNumber;
    number: number;
  };
}

export const fetchMaxBorrowAmount = async (
  cTokens: string[],
  underlyingDecimals: BigNumber[],
  comptrollerAddress: string,
  sdk: IonicSdk,
  address: string,
  nonWhitelistedTotalBorrows: BigNumber[]
) => {
  const cTokenToMaxBorrowAmount: CTokenToMaxBorrow = {};

  await Promise.all(
    cTokens.map(async (cToken, index) => {
      const maxBorrow = (await sdk.contracts.PoolLensSecondary.callStatic.getMaxBorrow(
        address,
        cToken
      )) as BigNumber;

      const comptroller = sdk.createComptroller(comptrollerAddress);
      const [borrowCap, isWhitelisted] = await Promise.all([
        comptroller.callStatic.borrowCaps(cToken),
        comptroller.callStatic.isBorrowCapWhitelisted(cToken, address)
      ]);

      let bigNumber: BigNumber;

      // if address isn't in borrw cap whitelist and asset has borrow cap
      if (!isWhitelisted && borrowCap.gt(constants.Zero)) {
        const availableCap = borrowCap.sub(nonWhitelistedTotalBorrows[index]);

        if (availableCap.lte(maxBorrow)) {
          bigNumber = availableCap;
        } else {
          bigNumber = maxBorrow;
        }
      } else {
        bigNumber = maxBorrow;
      }

      cTokenToMaxBorrowAmount[cToken] = {
        bigNumber,
        number: Number(utils.formatUnits(bigNumber, underlyingDecimals[index]))
      };
    })
  );

  return cTokenToMaxBorrowAmount;
};

export function useMaxBorrowAmount(
  asset: Pick<NativePricedIonicAsset, 'cToken' | 'underlyingDecimals'>,
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: borrowCapsDataForAsset } = useBorrowCapsDataForAsset(asset.cToken, chainId);

  return useQuery(
    [
      'useMaxBorrowAmount',
      asset.cToken,
      comptrollerAddress,
      asset.underlyingDecimals,
      sdk?.chainId,
      address,
      borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
    ],
    async () => {
      if (sdk && address && borrowCapsDataForAsset?.nonWhitelistedTotalBorrows) {
        try {
          const res = await fetchMaxBorrowAmount(
            [asset.cToken],
            [asset.underlyingDecimals],
            comptrollerAddress,
            sdk,
            address,
            [borrowCapsDataForAsset.nonWhitelistedTotalBorrows]
          );

          return res[asset.cToken];
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
        !!borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
    }
  );
}

export function useMaxBorrowAmounts(
  assets: Pick<NativePricedIonicAsset, 'cToken' | 'underlyingDecimals'>[],
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: borrowCapsForAssets } = useBorrowCapsForAssets(
    assets.map((asset) => asset.cToken),
    chainId
  );

  return useQuery(
    [
      'useMaxBorrowAmounts',
      assets.map((asset) => asset.cToken + asset.underlyingDecimals).sort(),
      comptrollerAddress,
      sdk?.chainId,
      address,
      borrowCapsForAssets
        ? Object.entries(borrowCapsForAssets)
            .map(([key, value]) => key + value.nonWhitelistedTotalBorrows)
            .sort()
        : null
    ],
    async () => {
      if (sdk && address && assets && assets.length > 0 && borrowCapsForAssets) {
        return await fetchMaxBorrowAmount(
          assets.map((asset) => asset.cToken),
          assets.map((asset) => asset.underlyingDecimals),
          comptrollerAddress,
          sdk,
          address,
          assets.map((asset) => borrowCapsForAssets[asset.cToken].nonWhitelistedTotalBorrows)
        );
      } else {
        return null;
      }
    },
    {
      enabled:
        !!address &&
        !!assets &&
        !!sdk &&
        !!comptrollerAddress &&
        !!borrowCapsForAssets &&
        Object.values(borrowCapsForAssets).reduce(
          (res, cap) => res && !!cap.nonWhitelistedTotalBorrows,
          true
        )
    }
  );
}
