import { useMemo } from 'react';

import { formatEther, parseUnits, type Address } from 'viem';
import { optimism } from 'viem/chains';
import { useBalance, useReadContract } from 'wagmi';

import {
  getReservesABI,
  getReservesContract,
  getReservesArgs,
  getToken
} from '@ui/utils/getStakingTokens';

interface UseLiquidityCalculationsProps {
  address?: Address;
  chainId: number;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export function useLiquidityCalculations({
  address,
  chainId,
  selectedToken
}: UseLiquidityCalculationsProps) {
  // Fetch reserves data
  const reserves = useReadContract({
    abi: getReservesABI(chainId),
    address: getReservesContract(chainId),
    args: getReservesArgs(chainId, selectedToken),
    functionName: 'getReserves',
    chainId: chainId,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: [0n, 0n]
    }
  });

  // Fetch balances
  const { data: ionBalance } = useBalance({
    address,
    token: getToken(chainId),
    chainId
  });

  const { data: selectedTokenBalance } = useBalance({
    address,
    ...(selectedToken !== 'eth' && { token: getToken(chainId) }),
    chainId
  });

  // Process reserve data considering chain specifics
  const processedReserves = useMemo(() => {
    if (reserves.status !== 'success' || !reserves.data) return null;

    const resData = reserves.data as
      | [bigint, bigint, bigint]
      | [bigint, bigint];

    // Handle chain-specific reserve ordering
    if (chainId === optimism.id) {
      return {
        ion: resData[1],
        token: resData[0]
      };
    }

    return {
      ion: resData[0],
      token: resData[1]
    };
  }, [reserves.status, reserves.data, chainId]);

  const calculateTokenAmount = (ionAmount: string): string => {
    if (!processedReserves || !ionAmount || processedReserves.ion === 0n)
      return '';

    try {
      const parsedIonAmount = parseUnits(ionAmount, 18);
      const tokenVal =
        (parsedIonAmount * processedReserves.token) / processedReserves.ion;
      return formatEther(tokenVal);
    } catch (error) {
      console.warn('Error calculating token amount:', error);
      return '';
    }
  };

  const getMaximumIonInput = (): string => {
    if (!processedReserves || !selectedTokenBalance || !ionBalance) return '0';

    try {
      const maxIonBasedOnBalance = ionBalance.value;
      const maxIonBasedOnReserves =
        (selectedTokenBalance.value * processedReserves.ion) /
        processedReserves.token;

      // Return the smaller of the two maximums
      return formatEther(
        maxIonBasedOnBalance < maxIonBasedOnReserves
          ? maxIonBasedOnBalance
          : maxIonBasedOnReserves
      );
    } catch (error) {
      console.warn('Error calculating maximum input:', error);
      return '0';
    }
  };

  // Check if a given ion amount would exceed available liquidity
  const wouldExceedLiquidity = (ionAmount: string): boolean => {
    if (!processedReserves || !selectedTokenBalance || !ionAmount) return false;

    try {
      const parsedIonAmount = parseUnits(ionAmount, 18);
      const requiredToken =
        (parsedIonAmount * processedReserves.token) / processedReserves.ion;
      return requiredToken > selectedTokenBalance.value;
    } catch {
      return false;
    }
  };

  return {
    calculateTokenAmount,
    getMaximumIonInput,
    wouldExceedLiquidity,
    ionBalance: ionBalance ? formatEther(ionBalance.value) : '0',
    selectedTokenBalance: selectedTokenBalance
      ? formatEther(selectedTokenBalance.value)
      : '0'
  };
}
