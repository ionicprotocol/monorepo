import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useBorrowCapsDataForAsset = (cTokenAddress: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useBorrowCapsDataForAsset', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        try {
          const borrowCapsData =
            await sdk.contracts.FusePoolLens.callStatic.getBorrowCapsDataForAsset(cTokenAddress);

          return borrowCapsData;
        } catch (e) {
          console.warn(`Getting borrow caps error: `, { cTokenAddress, poolChainId }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokenAddress && !!sdk,
    }
  );
};
