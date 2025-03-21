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

  // Debug the balance retrieval
  console.log('Balance debug:', {
    isNativeToken,
    nativeBalance: nativeBalance?.value?.toString(),
    tokenBalance: tokenBalance?.toString(),
    underlyingToken: asset.underlyingToken,
    address,
    supplyCapsStatus: !!supplyCapsDataForAsset
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
      console.log('Query function executing. Dependencies:', {
        sdk: !!sdk,
        address: !!address,
        supplyCapsData: !!supplyCapsDataForAsset,
        balance: balance?.toString()
      });

      // IMPORTANT CHANGE: Let's proceed even without supplyCapsDataForAsset
      if (!sdk || !address || balance === undefined) {
        return null;
      }

      try {
        // Get a valid balance value - this is correctly showing 2 tokens
        const userBalance = balance;

        // If supplyCapsDataForAsset is undefined, just use the balance directly
        if (!supplyCapsDataForAsset) {
          console.log(
            'No supply caps data, using direct balance:',
            userBalance.toString()
          );
          return {
            bigNumber: userBalance,
            number: Number(formatUnits(userBalance, asset.underlyingDecimals))
          };
        }

        const comptroller = sdk.createComptroller(comptrollerAddress);

        try {
          const [supplyCap, isWhitelisted] = await Promise.all([
            comptroller.read.supplyCaps([asset.cToken]),
            comptroller.read.isSupplyCapWhitelisted([asset.cToken, address])
          ]);

          console.log('Supply cap debug:', {
            supplyCap: supplyCap.toString(),
            nonWhitelistedTotalSupply:
              supplyCapsDataForAsset.nonWhitelistedTotalSupply.toString(),
            balance: balance.toString(),
            isWhitelisted
          });

          let bigNumber: bigint;

          if (!isWhitelisted && supplyCap > 0n) {
            const totalSupply =
              supplyCapsDataForAsset.nonWhitelistedTotalSupply;

            // Make sure availableCap doesn't go negative
            const availableCap =
              totalSupply >= supplyCap ? 0n : supplyCap - totalSupply;

            console.log('Available cap:', availableCap.toString());

            bigNumber =
              availableCap <= userBalance ? availableCap : userBalance;
          } else {
            bigNumber = userBalance;
          }

          const formattedNumber = Number(
            formatUnits(bigNumber, asset.underlyingDecimals)
          );

          console.log('Final calculated values:', {
            bigNumber: bigNumber.toString(),
            formattedNumber
          });

          return {
            bigNumber,
            number: formattedNumber
          };
        } catch (e) {
          console.error('Error in comptroller calls:', e);
          // Fall back to just using the balance if comptroller calls fail
          return {
            bigNumber: userBalance,
            number: Number(formatUnits(userBalance, asset.underlyingDecimals))
          };
        }
      } catch (e) {
        console.error(
          'Getting max supply amount error:',
          { address, cToken: asset.cToken, comptrollerAddress },
          e
        );

        // If we have a balance, return it as fallback
        if (balance) {
          console.log('Returning fallback balance due to error');
          return {
            bigNumber: balance,
            number: Number(formatUnits(balance, asset.underlyingDecimals))
          };
        }

        return null;
      }
    },
    enabled:
      !!address &&
      !!asset &&
      !!sdk &&
      !!comptrollerAddress &&
      // IMPORTANT: Removed the supplyCapsDataForAsset dependency here!
      // Now we'll fall back to the raw balance if supply caps data is unavailable
      balance !== undefined,
    refetchInterval: 5000
  });
}
