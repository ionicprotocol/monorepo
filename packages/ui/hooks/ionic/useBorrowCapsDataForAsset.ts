import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const fetchBorrowCaps = async (sdk: IonicSdk, cTokens: Address[]) => {
  const cTokenToBorrowCaps: {
    [cToken: Address]: {
      borrowCapsPerCollateral: bigint[];
      collateral: Address[];
      collateralBlacklisted: boolean[];
      nonWhitelistedTotalBorrows: bigint;
      totalBorrowCap: bigint;
    };
  } = {};

  await Promise.all(
    cTokens.map(async (cToken) => {
      const [
        collateral,
        borrowCapsPerCollateral,
        collateralBlacklisted,
        totalBorrowCap,
        nonWhitelistedTotalBorrows
      ] = await sdk.contracts.PoolLens.read.getBorrowCapsDataForAsset([cToken]);

      cTokenToBorrowCaps[cToken] = {
        collateral: collateral as Address[],
        borrowCapsPerCollateral: borrowCapsPerCollateral as bigint[],
        collateralBlacklisted: collateralBlacklisted as boolean[],
        totalBorrowCap,
        nonWhitelistedTotalBorrows
      };
    })
  );

  return cTokenToBorrowCaps;
};

export const useBorrowCapsDataForAsset = (
  cTokenAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useBorrowCapsDataForAsset', cTokenAddress, sdk?.chainId],

    queryFn: async () => {
      if (cTokenAddress && sdk) {
        try {
          const borrowCaps = await fetchBorrowCaps(sdk, [cTokenAddress]);

          return borrowCaps[cTokenAddress];
        } catch (e) {
          console.warn(
            `Getting borrow caps error: `,
            { cTokenAddress, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!cTokenAddress && !!sdk
  });
};

export const useBorrowCapsForAssets = (cTokens?: Address[], poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useBorrowCapsForAssets', cTokens, sdk?.chainId],

    queryFn: async () => {
      if (cTokens && cTokens.length > 0 && sdk) {
        try {
          return await fetchBorrowCaps(sdk, cTokens);
        } catch (e) {
          console.warn(
            `Getting borrow caps error: `,
            { cTokens, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!cTokens && cTokens.length > 0 && !!sdk
  });
};
