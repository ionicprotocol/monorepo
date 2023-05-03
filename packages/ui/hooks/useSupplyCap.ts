import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { Cap } from '@ui/hooks/useBorrowCap';
import type { MarketData } from '@ui/types/TokensDataMap';

interface UseSupplyCapParams {
  chainId: number;
  comptroller: string;
  market: MarketData;
}
export const useSupplyCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market,
}: UseSupplyCapParams) => {
  const { data: usdPrices } = useAllUsdPrices();
  const { address } = useMultiMidas();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[chainId.toString()]) {
      return usdPrices[chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, chainId]);
  const sdk = useSdk(chainId);

  return useQuery<Cap | null | undefined>(
    [
      'useSupplyCap',
      comptrollerAddress,
      sdk?.chainId,
      market.cToken,
      market.underlyingPrice,
      usdPrice,
      address,
    ],
    async () => {
      if (sdk && usdPrice && market && address) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [supplyCap, supplyCapWhitelist] = await Promise.all([
            comptroller.callStatic.supplyCaps(market.cToken),
            comptroller.callStatic.supplyCapWhitelist(market.cToken, address),
          ]);

          if (supplyCapWhitelist || supplyCap.eq(constants.Zero)) {
            return null;
          } else {
            const _supplyCap = market.totalSupply.gt(supplyCap) ? market.totalSupply : supplyCap;
            const tokenCap = Number(utils.formatUnits(_supplyCap, market.underlyingDecimals));
            const usdCap =
              tokenCap *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;

            return { tokenCap, type: 'supply', usdCap };
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
      enabled: !!sdk && !!usdPrice && !!market && !!address,
      staleTime: Infinity,
    }
  );
};
