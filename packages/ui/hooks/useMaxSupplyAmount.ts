import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import { useBalance, useReadContract } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useSupplyCapsDataForAsset } from '@ui/hooks/fuse/useSupplyCapsDataForPool';

import type { Address } from 'viem';

import type { NativePricedIonicAsset } from '@ionicprotocol/types';

const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const erc20BalanceAbi = [
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

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

  const isNativeToken =
    asset.underlyingToken.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase();

  // Handle native token balance
  const { data: nativeBalance } = useBalance({
    address,
    chainId,
    query: {
      enabled: isNativeToken && !!address
    }
  });

  // Handle ERC20 token balance
  const { data: tokenBalance } = useReadContract({
    address: asset.underlyingToken as `0x${string}`,
    abi: erc20BalanceAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId,
    query: {
      enabled: !isNativeToken && !!address,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Combined balance from either native or token
  const balance = isNativeToken ? nativeBalance?.value : tokenBalance;

  return useQuery({
    queryKey: [
      'useMaxSupplyAmount',
      asset.underlyingToken,
      asset.cToken,
      asset.underlyingDecimals,
      comptrollerAddress,
      chainId,
      address,
      supplyCapsDataForAsset,
      balance
    ],
    queryFn: async () => {
      if (!sdk || !address || !supplyCapsDataForAsset || !balance) {
        return null;
      }

      try {
        const comptroller = sdk.createComptroller(comptrollerAddress);
        const [supplyCap, isWhitelisted] = await Promise.all([
          comptroller.read.supplyCaps([asset.cToken]),
          comptroller.read.isSupplyCapWhitelisted([asset.cToken, address])
        ]);

        let bigNumber: bigint;

        // If address isn't in supply cap whitelist and asset has supply cap
        if (!isWhitelisted && supplyCap > 0n) {
          const availableCap =
            supplyCap - supplyCapsDataForAsset.nonWhitelistedTotalSupply;
          bigNumber = availableCap <= balance ? availableCap : balance;
        } else {
          bigNumber = balance;
        }

        return {
          bigNumber,
          number: Number(formatUnits(bigNumber, asset.underlyingDecimals))
        };
      } catch (e) {
        console.warn(
          'Getting max supply amount error:',
          { address, cToken: asset.cToken, comptrollerAddress },
          e
        );
        return null;
      }
    },
    enabled:
      !!address &&
      !!asset &&
      !!sdk &&
      !!comptrollerAddress &&
      !!supplyCapsDataForAsset &&
      balance !== undefined,
    refetchInterval: 5000
  });
}
