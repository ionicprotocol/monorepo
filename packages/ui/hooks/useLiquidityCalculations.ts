import { useMemo } from 'react';

import { formatEther, parseUnits, type Address } from 'viem';
import { optimism } from 'viem/chains';
import { useBalance, useReadContract } from 'wagmi';

import {
  getReservesABI,
  getReservesContract,
  getReservesArgs,
  getToken,
  getPoolToken
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

  // Fetch ION balance
  const { data: ionBalance, refetch: refetchIonBalance } = useBalance({
    address,
    token: getToken(chainId),
    chainId
  });

  // Fetch selected token balance with correct token address
  const { data: selectedTokenBalance, refetch: refetchSelectedTokenBalance } =
    useBalance({
      address,
      // For ETH, don't provide a token address
      // For MODE, use the correct MODE token address from getPoolToken
      // For WETH, use the WETH address from getPoolToken
      ...(selectedToken !== 'eth' && {
        token: getPoolToken(selectedToken)
      }),
      chainId
    });

  const refetchAll = async () => {
    await Promise.all([
      reserves.refetch(),
      refetchIonBalance(),
      refetchSelectedTokenBalance()
    ]);
  };

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

  const processedReserves = useMemo(() => {
    if (reserves.status !== 'success' || !reserves.data) {
      return null;
    }

    const resData = reserves.data as
      | [bigint, bigint, bigint]
      | [bigint, bigint];

    if (chainId === optimism.id) {
      return {
        ion: resData[1],
        token: resData[0]
      };
    }

    const result = {
      ion: resData[0],
      token: resData[1]
    };

    return result;
  }, [reserves.status, reserves.data, chainId]);

  const getMaximumIonInput = (): string => {
    if (!processedReserves || !selectedTokenBalance || !ionBalance) {
      return '0';
    }

    try {
      const maxIonBasedOnBalance = ionBalance.value;
      const maxIonBasedOnReserves =
        (selectedTokenBalance.value * processedReserves.ion) /
        processedReserves.token;

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
      : '0',
    refetchAll
  };
}
