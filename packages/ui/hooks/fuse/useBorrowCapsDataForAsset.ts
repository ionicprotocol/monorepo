import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

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
          const [
            collateral,
            borrowCapsPerCollateral,
            collateralBlacklisted,
            totalBorrowCap,
            nonWhitelistedTotalBorrows
          ] = await sdk.contracts.PoolLens.read.getBorrowCapsDataForAsset([
            cTokenAddress
          ]);

          return {
            collateral,
            borrowCapsPerCollateral,
            collateralBlacklisted,
            totalBorrowCap,
            nonWhitelistedTotalBorrows
          };
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

    enabled: !!cTokenAddress && !!sdk,
    staleTime: Infinity
  });
};
