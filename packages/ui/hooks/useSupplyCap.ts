import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants, utils } from 'ethers';

import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useSupplyCap = (
  comptrollerAddress: string,
  cToken: string,
  underlyingPrice: BigNumber,
  poolChainId: number
) => {
  const cgId = useCgId(Number(poolChainId));
  const { data: usdPrice } = useUSDPrice(cgId);
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useSupplyCap', sdk?.chainId, underlyingPrice, usdPrice],
    async () => {
      if (sdk && usdPrice) {
        try {
          const comptroller = sdk.getComptrollerInstance(comptrollerAddress);
          const supplyCaps = await comptroller.callStatic.supplyCaps(cToken);

          if (supplyCaps.eq(constants.Zero)) {
            return null;
          } else {
            const usdCap =
              Number(utils.formatUnits(supplyCaps, DEFAULT_DECIMALS)) *
              Number(utils.formatUnits(underlyingPrice, DEFAULT_DECIMALS)) *
              usdPrice;
            const nativeCap = Number(utils.formatUnits(supplyCaps, DEFAULT_DECIMALS));

            return { usdCap, nativeCap };
          }
        } catch (e) {
          console.warn(
            `Could not fetch supply caps of market ${cToken} of comptroller ${comptrollerAddress} `
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
