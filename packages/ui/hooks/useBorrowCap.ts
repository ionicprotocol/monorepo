import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, formatUnits } from 'viem';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/fuse/useBorrowCapsDataForAsset';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

export interface Cap {
  tokenCap: number;
  type: 'borrow' | 'supply';
  underlyingCap: bigint;
  usdCap: number;
}

interface UseBorrowCapParams {
  chainId: number;
  comptroller: Address;
  market: MarketData;
}
export const useBorrowCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market
}: UseBorrowCapParams) => {
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
  const { data: borrowCapsDataForAsset } = useBorrowCapsDataForAsset(
    market.cToken,
    chainId
  );

  return useQuery({
    queryKey: [
      'useBorrowCap',
      comptrollerAddress,
      sdk?.chainId,
      market.underlyingPrice,
      market.cToken,
      market.totalBorrow,
      usdPrice,
      borrowCapsDataForAsset?.nonWhitelistedTotalBorrows,
      address
    ],

    queryFn: async () => {
      if (
        sdk &&
        usdPrice &&
        market &&
        address &&
        borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
      ) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [borrowCap, isBorrowCapWhitelist] = await Promise.all([
            comptroller.read.borrowCaps([market.cToken]),
            comptroller.read.isBorrowCapWhitelisted([market.cToken, address])
          ]);

          if (isBorrowCapWhitelist || borrowCap === 0n) {
            return null;
          } else {
            const whitelistedTotalBorrows =
              market.totalBorrow -
              borrowCapsDataForAsset.nonWhitelistedTotalBorrows;
            const underlyingCap = borrowCap + whitelistedTotalBorrows;
            const tokenCap = Number(
              formatUnits(underlyingCap, market.underlyingDecimals)
            );
            const usdCap =
              tokenCap *
              Number(formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;

            return { tokenCap, type: 'borrow', underlyingCap, usdCap };
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

    gcTime: Infinity,

    enabled:
      !!sdk &&
      !!usdPrice &&
      !!market &&
      !!address &&
      !!borrowCapsDataForAsset?.nonWhitelistedTotalBorrows,

    staleTime: Infinity
  });
};
