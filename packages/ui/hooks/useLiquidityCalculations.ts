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
  selectedToken: 'eth' | 'lsk' | 'mode' | 'weth';
}

export function useLiquidityCalculations({
  address,
  chainId,
  selectedToken
}: UseLiquidityCalculationsProps) {
  const reservesContractAddress = getReservesContract(chainId);
  const reservesAbi = getReservesABI(chainId);
  const reservesArgs = getReservesArgs(chainId, selectedToken);

  const reserves = useReadContract({
    abi: reservesAbi,
    address: reservesContractAddress,
    args: reservesArgs,
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
    if (!ionAmount) return '';

    try {
      const parsedIonAmount = parseUnits(ionAmount, 18);

      if (!processedReserves || processedReserves.ion === 0n) {
        return ionAmount;
      }

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
    if (!selectedTokenBalance || !ionBalance) {
      return '0';
    }

    try {
      const maxIonBasedOnBalance = ionBalance.value;

      if (!processedReserves || processedReserves.token === 0n) {
        return formatEther(maxIonBasedOnBalance);
      }

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
    if (!selectedTokenBalance || !ionAmount) return false;

    try {
      if (!processedReserves || processedReserves.ion === 0n) {
        const parsedIonAmount = parseUnits(ionAmount, 18);
        return parsedIonAmount > selectedTokenBalance.value;
      }

      const parsedIonAmount = parseUnits(ionAmount, 18);
      const requiredToken =
        (parsedIonAmount * processedReserves.token) / processedReserves.ion;
      return requiredToken > selectedTokenBalance.value;
    } catch (error) {
      console.warn('Error checking liquidity:', error);
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
