import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

export interface Cap {
  tokenCap: number;
  type: 'borrow' | 'supply';
  usdCap: number;
}

interface UseBorrowCapParams {
  chainId: number;
  comptroller: string;
  market: MarketData;
}
export const useBorrowCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market,
}: UseBorrowCapParams) => {
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
      'useBorrowCap',
      comptrollerAddress,
      sdk?.chainId,
      market.underlyingPrice,
      market.cToken,
      usdPrice,
      address,
    ],
    async () => {
      if (sdk && usdPrice && market && address) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [borrowCap, borrowCapWhitelist] = await Promise.all([
            comptroller.callStatic.borrowCaps(market.cToken),
            comptroller.callStatic.borrowCapWhitelist(market.cToken, address),
          ]);

          if (borrowCapWhitelist || borrowCap.eq(constants.Zero)) {
            return null;
          } else {
            const usdCap =
              Number(utils.formatUnits(borrowCap, market.underlyingDecimals)) *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;
            const tokenCap = Number(utils.formatUnits(borrowCap, market.underlyingDecimals));

            return { tokenCap, type: 'borrow', usdCap };
          }
        } catch (e) {
          console.warn(
            `Could not fetch borrow caps of market ${market.cToken} of comptroller ${comptrollerAddress}`,
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
