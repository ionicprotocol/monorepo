import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useMaxBorrowAmount(
  asset: NativePricedFuseAsset,
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useMaxBorrowAmount',
      asset.cToken,
      comptrollerAddress,
      asset.totalBorrow,
      sdk?.chainId,
      address,
    ],
    async () => {
      if (sdk && address) {
        const maxBorrow = (await sdk.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
          address,
          asset.cToken
        )) as BigNumber;

        const comptroller = sdk.createComptroller(comptrollerAddress);
        const borrowCap = await comptroller.callStatic.borrowCaps(asset.cToken);

        let bigNumber: BigNumber;

        // if asset has borrow cap
        if (borrowCap.gt(constants.Zero)) {
          const availableCap = borrowCap.sub(asset.totalBorrow);

          if (availableCap.lte(maxBorrow)) {
            bigNumber = availableCap;
          } else {
            bigNumber = maxBorrow;
          }
        } else {
          bigNumber = maxBorrow;
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
      enabled: !!address && !!asset && !!sdk && !!comptrollerAddress,
      staleTime: Infinity,
    }
  );
}
