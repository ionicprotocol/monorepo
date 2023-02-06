import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { Cap } from '@ui/hooks/useBorrowCap';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { MarketData } from '@ui/types/TokensDataMap';

interface UseSupplyCapParams {
  comptroller: string;
  chainId: number;
  market: MarketData;
}
export const useSupplyCap = ({
  comptroller: comptrollerAddress,
  chainId,
  market,
}: UseSupplyCapParams) => {
  const { data: usdPrice } = useNativePriceInUSD(Number(chainId));
  const sdk = useSdk(chainId);

  return useQuery<Cap | null | undefined>(
    [
      'useSupplyCap',
      comptrollerAddress,
      sdk?.chainId,
      market.cToken,
      market.underlyingPrice,
      usdPrice,
    ],
    async () => {
      if (sdk && usdPrice && market) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const supplyCap = await comptroller.callStatic.supplyCaps(market.cToken);

          if (supplyCap.eq(constants.Zero)) {
            return null;
          } else {
            const usdCap =
              Number(utils.formatUnits(supplyCap, market.underlyingDecimals)) *
              Number(utils.formatUnits(market.underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;
            const tokenCap = Number(utils.formatUnits(supplyCap, market.underlyingDecimals));

            return { usdCap, tokenCap, type: 'supply' };
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
      staleTime: Infinity,
      enabled: !!sdk && !!usdPrice && !!market,
    }
  );
};
