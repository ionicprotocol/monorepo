import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

import type { Address } from 'viem';

export interface SupplyCapsDataForPoolType {
  cTokenAddress: string;
  nonWhitelistedTotalSupply: bigint;
  supplyCaps: bigint;
}

export const useSupplyCapsDataForPool = (
  comptrollerAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useSupplyCapsDataForPool', comptrollerAddress, sdk?.chainId],

    queryFn: async () => {
      if (comptrollerAddress && sdk) {
        try {
          const res: SupplyCapsDataForPoolType[] = [];

          const supplyCapsData =
            await sdk.contracts.PoolLens.read.getSupplyCapsDataForPool([
              comptrollerAddress
            ]);

          if (supplyCapsData) {
            supplyCapsData[0].map((data, i) => {
              res.push({
                cTokenAddress: data,
                nonWhitelistedTotalSupply: supplyCapsData[2][i],
                supplyCaps: supplyCapsData[1][i]
              });
            });
          }

          return res;
        } catch (e) {
          console.warn(
            `Getting supply caps error: `,
            { comptrollerAddress, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!comptrollerAddress && !!sdk
  });
};

export const useSupplyCapsDataForAsset = (
  comptrollerAddress?: Address,
  cTokenAddress?: Address,
  poolChainId?: number
) => {
  const { data: supplyCapsDataForPool } = useSupplyCapsDataForPool(
    comptrollerAddress,
    poolChainId
  );

  return useQuery({
    queryKey: [
      'useSupplyCapsDataForAsset',
      supplyCapsDataForPool?.sort((a, b) =>
        a.cTokenAddress.localeCompare(b.cTokenAddress)
      ),
      cTokenAddress
    ],

    queryFn: () => {
      if (supplyCapsDataForPool && cTokenAddress) {
        const res = supplyCapsDataForPool.find(
          (data) => data.cTokenAddress === cTokenAddress
        );

        if (res) {
          return res;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!supplyCapsDataForPool && !!cTokenAddress
  });
};
