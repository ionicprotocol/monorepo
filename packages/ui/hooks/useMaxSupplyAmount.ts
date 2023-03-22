import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxSupplyAmount(
  asset: NativePricedFuseAsset,
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useMaxSupplyAmount',
      asset.underlyingToken,
      asset.cToken,
      comptrollerAddress,
      asset.totalSupply,
      sdk?.chainId,
      address,
    ],
    async () => {
      if (sdk && address) {
        const tokenBalance = await fetchTokenBalance(asset.underlyingToken, sdk, address);

        const comptroller = sdk.createComptroller(comptrollerAddress);
        const supplyCap = await comptroller.callStatic.supplyCaps(asset.cToken);

        let bigNumber: BigNumber;

        // if asset has supply cap
        if (supplyCap.gt(constants.Zero)) {
          const availableCap = supplyCap.sub(asset.totalSupply);

          if (availableCap.lte(tokenBalance)) {
            bigNumber = availableCap;
          } else {
            bigNumber = tokenBalance;
          }
        } else {
          bigNumber = tokenBalance;
        }

        return {
          bigNumber: bigNumber,
          number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals)),
        };
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!address && !!asset && !!sdk && !!comptrollerAddress,
    }
  );
}
