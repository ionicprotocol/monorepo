import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useMemo } from 'react';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsDataForAsset } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData } from '@ui/types/TokensDataMap';

export interface Cap {
  tokenCap: number;
  type: 'borrow' | 'supply';
  underlyingCap: BigNumber;
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
  const { data: borrowCapsDataForAsset } = useBorrowCapsDataForAsset(market.cToken, chainId);

  return useQuery<Cap | null | undefined>(
    [
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
    async () => {
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
            comptroller.callStatic.borrowCaps(market.cToken),
            comptroller.callStatic.isBorrowCapWhitelisted(market.cToken, address)
          ]);

          if (isBorrowCapWhitelist || borrowCap.eq(constants.Zero)) {
            return null;
          } else {
            const whitelistedTotalBorrows = market.totalBorrow.sub(
              borrowCapsDataForAsset.nonWhitelistedTotalBorrows
            );
            const underlyingCap = borrowCap.add(whitelistedTotalBorrows);
            const tokenCap = Number(utils.formatUnits(underlyingCap, market.underlyingDecimals));
            const usdCap =
              tokenCap *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
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
    {
      enabled:
        !!sdk &&
        !!usdPrice &&
        !!market &&
        !!address &&
        !!borrowCapsDataForAsset?.nonWhitelistedTotalBorrows
    }
  );
};
