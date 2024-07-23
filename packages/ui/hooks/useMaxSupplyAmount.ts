import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { useBalance } from 'wagmi';
import { Address, formatUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useSupplyCapsDataForAsset } from '@ui/hooks/fuse/useSupplyCapsDataForPool';

export function useMaxSupplyAmount(
  asset: Pick<
    NativePricedIonicAsset,
    'cToken' | 'underlyingDecimals' | 'underlyingToken'
  >,
  comptrollerAddress: Address,
  chainId: number
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const { data: supplyCapsDataForAsset } = useSupplyCapsDataForAsset(
    comptrollerAddress,
    asset.cToken,
    chainId
  );
  const { data: balanceData } = useBalance({
    address: address,
    token: asset.underlyingToken as `0x${string}`
  });

  return useQuery({
    queryKey: [
      'useMaxSupplyAmount',
      asset.underlyingToken,
      asset.cToken,
      asset.underlyingDecimals,
      comptrollerAddress,
      sdk?.chainId,
      address,
      supplyCapsDataForAsset
    ],

    queryFn: async () => {
      if (sdk && address && supplyCapsDataForAsset && balanceData) {
        try {
          const tokenBalance = balanceData.value;

          const comptroller = sdk.createComptroller(comptrollerAddress);
          const [supplyCap, isWhitelisted] = await Promise.all([
            comptroller.read.supplyCaps([asset.cToken]),
            comptroller.read.isSupplyCapWhitelisted([asset.cToken, address])
          ]);

          let bigNumber: bigint;

          // if address isn't in supply cap whitelist and asset has supply cap
          if (!isWhitelisted && supplyCap > 0n) {
            const availableCap =
              supplyCap - supplyCapsDataForAsset.nonWhitelistedTotalSupply;

            if (availableCap <= tokenBalance) {
              bigNumber = availableCap;
            } else {
              bigNumber = tokenBalance;
            }
          } else {
            bigNumber = tokenBalance;
          }

          return {
            bigNumber: bigNumber,
            number: Number(formatUnits(bigNumber, asset.underlyingDecimals))
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

    gcTime: Infinity,

    enabled:
      !!address && !!asset && !!sdk && !!comptrollerAddress && !!balanceData,

    staleTime: Infinity
  });
}
