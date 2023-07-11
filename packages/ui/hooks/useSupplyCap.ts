import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useSupplyCapsDataForAsset } from '@ui/hooks/fuse/useSupplyCapsDataForPool';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { Cap } from '@ui/hooks/useBorrowCap';
import type { MarketData } from '@ui/types/TokensDataMap';

interface UseSupplyCapParams {
  chainId: number;
  comptroller: string;
  market: Pick<MarketData, 'cToken' | 'totalSupply' | 'underlyingDecimals' | 'underlyingPrice'>;
}
export const useSupplyCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market,
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
    market.cToken,
    chainId
  );

  return useQuery<Cap | null | undefined>(
    [
      'useSupplyCap',
      comptrollerAddress,
      sdk?.chainId,
      market.cToken,
      market.totalSupply,
      market.underlyingPrice,
      market.underlyingDecimals,
      usdPrice,
      address,
      supplyCapsDataForAsset,
    ],
    async () => {
      if (sdk && usdPrice && market && address && supplyCapsDataForAsset) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [supplyCap, isSupplyCapWhitelist] = await Promise.all([
            comptroller.callStatic.supplyCaps(market.cToken),
            comptroller.callStatic.isSupplyCapWhitelisted(market.cToken, address),
          ]);

          if (isSupplyCapWhitelist || supplyCap.eq(constants.Zero)) {
            return null;
          } else {
            const whitelistedTotalSupply = market.totalSupply.sub(
              supplyCapsDataForAsset.nonWhitelistedTotalSupply
            );
            const underlyingCap = supplyCap.add(whitelistedTotalSupply);
            const tokenCap = Number(utils.formatUnits(underlyingCap, market.underlyingDecimals));
            const usdCap =
              tokenCap *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;

            return { tokenCap, type: 'supply', underlyingCap, usdCap };
          }
        } catch (e) {
          console.warn(
            `Could not fetch supply caps of market ${market.cToken} of comptroller ${comptrollerAddress} `,
            e
          );
          // TODO: Add Sentry
          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!usdPrice && !!market && !!address && !!supplyCapsDataForAsset,
      staleTime: Infinity,
    }
  );
};
