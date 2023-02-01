import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { MarketData } from '@ui/types/TokensDataMap';

export interface Cap {
  usdCap: number;
  tokenCap: number;
  type: 'supply' | 'borrow';
}

interface UseBorrowCapParams {
  comptroller: string;
  chainId: number;
  market: MarketData;
}
export const useBorrowCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market,
}: UseBorrowCapParams) => {
  const { data: usdPrice } = useNativePriceInUSD(Number(chainId));
  const sdk = useSdk(chainId);

  return useQuery<Cap | null | undefined>(
    [
      'useBorrowCap',
      comptrollerAddress,
      sdk?.chainId,
      market.underlyingPrice,
      market.cToken,
      usdPrice,
    ],
    async () => {
      if (sdk && usdPrice && market) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const borrowCap = await comptroller.callStatic.borrowCaps(market.cToken);

          if (borrowCap.eq(constants.Zero)) {
            return null;
          } else {
            const usdCap =
              Number(utils.formatUnits(borrowCap, market.underlyingDecimals)) *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;
            const tokenCap = Number(utils.formatUnits(borrowCap, market.underlyingDecimals));

            return { usdCap, tokenCap, type: 'borrow' };
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
      staleTime: Infinity,
      enabled: !!sdk && !!usdPrice && !!market,
    }
  );
};
