import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useBorrowCapsDataForAsset = (cTokenAddress: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useBorrowCapsDataForAsset', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        const borrowCapsData =
          await sdk.contracts.FusePoolLens.callStatic.getBorrowCapsDataForAsset(cTokenAddress);

        return borrowCapsData;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!cTokenAddress && !!sdk,
      staleTime: Infinity,
    }
  );
};
