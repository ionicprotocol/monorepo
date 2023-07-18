import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useSupplyCapsDataForAsset } from '@ui/hooks/ionic/useSupplyCapsDataForPool';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxSupplyAmount(
  asset: Pick<NativePricedIonicAsset, 'cToken' | 'underlyingDecimals' | 'underlyingToken'>,
  comptrollerAddress: string,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: supplyCapsDataForAsset } = useSupplyCapsDataForAsset(
    comptrollerAddress,
    asset.cToken,
    chainId
  );

  return useQuery(
    [
      'useMaxSupplyAmount',
      asset.underlyingToken,
      asset.cToken,
      asset.underlyingDecimals,
      comptrollerAddress,
      sdk?.chainId,
      address,
      supplyCapsDataForAsset
    ],
    async () => {
      if (sdk && address && supplyCapsDataForAsset) {
        try {
          const tokenBalance = await fetchTokenBalance(asset.underlyingToken, sdk, address);

          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [supplyCap, isWhitelisted] = await Promise.all([
            comptroller.callStatic.supplyCaps(asset.cToken),
            comptroller.callStatic.isSupplyCapWhitelisted(asset.cToken, address)
          ]);

          let bigNumber: BigNumber;

          // if address isn't in supply cap whitelist and asset has supply cap
          if (!isWhitelisted && supplyCap.gt(constants.Zero)) {
            const availableCap = supplyCap.sub(supplyCapsDataForAsset.nonWhitelistedTotalSupply);

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
            number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals))
          };
        } catch (e) {
          console.warn(
            `Getting max supply amount error: `,
            { address, cToken: asset.cToken, comptrollerAddress },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!address && !!asset && !!sdk && !!comptrollerAddress
    }
  );
}
