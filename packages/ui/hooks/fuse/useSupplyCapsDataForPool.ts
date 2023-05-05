import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export interface SupplyCapsDataForPoolType {
  cTokenAddress: string;
  nonWhitelistedTotalSupply: BigNumber;
  supplyCaps: BigNumber;
}

export const useSupplyCapsDataForPool = (comptrollerAddress: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useSupplyCapsDataForPool', comptrollerAddress, sdk?.chainId],
    async () => {
      if (comptrollerAddress && sdk) {
        const res: SupplyCapsDataForPoolType[] = [];

        const supplyCapsData = await sdk.contracts.FusePoolLens.callStatic.getSupplyCapsDataForPool(
          comptrollerAddress
        );

        if (supplyCapsData) {
          supplyCapsData[0].map((data, i) => {
            res.push({
              cTokenAddress: data,
              nonWhitelistedTotalSupply: supplyCapsData[2][i],
              supplyCaps: supplyCapsData[1][i],
            });
          });
        }

        return res;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!comptrollerAddress && !!sdk,
      staleTime: Infinity,
    }
  );
};

export const useSupplyCapsDataForAsset = (
  comptrollerAddress: string,
  cTokenAddress: string,
  poolChainId?: number
) => {
  const { data: supplyCapsDataForPool } = useSupplyCapsDataForPool(comptrollerAddress, poolChainId);

  return useQuery(
    [
      'useSupplyCapsDataForAsset',
      supplyCapsDataForPool?.map((data) => data.cTokenAddress),
      cTokenAddress,
    ],
    () => {
      if (supplyCapsDataForPool && cTokenAddress) {
        const res = supplyCapsDataForPool.find((data) => data.cTokenAddress === cTokenAddress);

        if (res) {
          return res;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!supplyCapsDataForPool && !!cTokenAddress,
      staleTime: Infinity,
    }
  );
};
