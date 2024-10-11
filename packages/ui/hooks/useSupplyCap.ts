import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type Address, formatUnits } from 'viem';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useSupplyCapsDataForAsset } from '@ui/hooks/fuse/useSupplyCapsDataForPool';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

interface UseSupplyCapParams {
  chainId: number;
  comptroller: Address;
  market?: Pick<
    MarketData,
    'cToken' | 'totalSupply' | 'underlyingDecimals' | 'underlyingPrice'
  >;
}
export const useSupplyCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market
}: UseSupplyCapParams) => {
  const { data: usdPrices } = useAllUsdPrices();
  const { address } = useMultiIonic();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[chainId.toString()]) {
      return usdPrices[chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, chainId]);
  const sdk = useSdk(chainId);
  const { data: supplyCapsDataForAsset } = useSupplyCapsDataForAsset(
    comptrollerAddress,
    market?.cToken,
    chainId
  );

  return useQuery({
    queryKey: [
      'useSupplyCap',
      comptrollerAddress,
      sdk?.chainId,
      market?.cToken,
      market?.totalSupply,
      market?.underlyingPrice,
      market?.underlyingDecimals,
      usdPrice,
      address,
      supplyCapsDataForAsset
    ],

    queryFn: async () => {
      const comptroller = sdk!.createComptroller(comptrollerAddress);
      const [supplyCap, isSupplyCapWhitelist] = await Promise.all([
        comptroller.read.supplyCaps([market!.cToken]),
        comptroller.read.isSupplyCapWhitelisted([market!.cToken, address!])
      ]);

      if (isSupplyCapWhitelist || supplyCap === 0n) {
        return null;
      } else {
        const whitelistedTotalSupply =
          market!.totalSupply -
          supplyCapsDataForAsset!.nonWhitelistedTotalSupply;
        const underlyingCap = supplyCap + whitelistedTotalSupply;
        const tokenCap = Number(
          formatUnits(underlyingCap, market!.underlyingDecimals)
        );
        const usdCap =
          tokenCap *
          Number(formatUnits(market!.underlyingPrice, DEFAULT_DECIMALS)) *
          usdPrice!;

        return { tokenCap, type: 'supply', underlyingCap, usdCap };
      }
    },

    gcTime: Infinity,

    enabled:
      !!sdk && !!usdPrice && !!market && !!address && !!supplyCapsDataForAsset,

    staleTime: Infinity
  });
};
