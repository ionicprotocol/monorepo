import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants, utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export interface Cap {
  usdCap: number;
  nativeCap: number;
  type: 'supply' | 'borrow';
}

export const useBorrowCap = (
  comptrollerAddress: string,
  cToken: string,
  underlyingPrice: BigNumber,
  poolChainId: number
) => {
  const cgId = useCgId(Number(poolChainId));
  const { data: usdPrice } = useUSDPrice(cgId);
  const sdk = useSdk(poolChainId);

  return useQuery<Cap | null | undefined>(
    ['useBorrowCap', sdk?.chainId, cToken, comptrollerAddress, underlyingPrice, usdPrice],
    async () => {
      if (sdk && usdPrice) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const borrowCap = await comptroller.callStatic.borrowCaps(cToken);

          if (borrowCap.eq(constants.Zero)) {
            return null;
          } else {
            const usdCap =
              Number(utils.formatUnits(borrowCap, DEFAULT_DECIMALS)) *
              Number(utils.formatUnits(underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;
            const nativeCap = Number(utils.formatUnits(borrowCap, DEFAULT_DECIMALS));

            return { usdCap, nativeCap, type: 'borrow' };
          }
        } catch (e) {
          console.warn(
            `Could not fetch borrow caps of market ${cToken} of comptroller ${comptrollerAddress} `
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!sdk && !!usdPrice,
    }
  );
};
