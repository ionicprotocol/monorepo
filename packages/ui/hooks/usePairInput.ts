import { useState, useCallback, useMemo } from 'react';
import { formatUnits, parseUnits, type Address } from 'viem';
import { useBalance, useReadContract } from 'wagmi';

interface PairValues {
  tokenA: string;
  tokenB: string;
}

interface UsePairInputProps {
  address?: Address;
  chainId: number;
  // Contract-related parameters
  reservesAbi: any;
  reservesAddress: Address;
  reservesArgs: any[];
  reservesFunctionName?: string;
  // Token information
  tokenAAddress?: Address;
  tokenBAddress?: Address;
  // Configuration
  tokenADecimals?: number;
  tokenBDecimals?: number;
  isReversed?: boolean;
}

interface UsePairInputReturn {
  // State
  values: PairValues;
  // Methods for updating values
  setTokenAValue: (value: string) => void;
  setTokenBValue: (value: string) => void;
  resetValues: () => void;
  // Balance and maximum information
  tokenABalance: string;
  tokenBBalance: string;
  effectiveMaxTokenA: string;
  effectiveMaxTokenB: string;
  // Utility functions
  wouldExceedLiquidity: (tokenAAmount: string, isTokenA: boolean) => boolean;
  // Loading states
  isLoading: boolean;
}

export function usePairInput({
  address,
  chainId,
  reservesAbi,
  reservesAddress,
  reservesArgs,
  reservesFunctionName = 'getReserves',
  tokenAAddress,
  tokenBAddress,
  tokenADecimals = 18,
  tokenBDecimals = 18,
  isReversed = false
}: UsePairInputProps): UsePairInputReturn {
  const [values, setValues] = useState<PairValues>({
    tokenA: '',
    tokenB: ''
  });

  // Fetch reserves data
  const reserves = useReadContract({
    abi: reservesAbi,
    address: reservesAddress,
    args: reservesArgs,
    functionName: reservesFunctionName,
    chainId,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: [0n, 0n]
    }
  });

  // Fetch balances for both tokens
  const { data: tokenABalanceData } = useBalance({
    address,
    token: tokenAAddress,
    chainId
  });

  const { data: tokenBBalanceData } = useBalance({
    address,
    token: tokenBAddress,
    chainId
  });

  // Process reserve data
  const processedReserves = useMemo(() => {
    if (reserves.status !== 'success' || !reserves.data) return null;

    const resData = reserves.data as [bigint, bigint];
    return {
      tokenA: isReversed ? resData[1] : resData[0],
      tokenB: isReversed ? resData[0] : resData[1]
    };
  }, [reserves.status, reserves.data, isReversed]);

  // Calculate the corresponding amounts based on input
  const calculatePairAmount = useCallback(
    (amount: string, isTokenA: boolean): string => {
      if (!processedReserves || !amount) return '';

      try {
        const decimalsIn = isTokenA ? tokenADecimals : tokenBDecimals;
        const decimalsOut = isTokenA ? tokenBDecimals : tokenADecimals;
        const parsedAmount = parseUnits(amount, decimalsIn);

        const result = isTokenA
          ? (parsedAmount * processedReserves.tokenB) / processedReserves.tokenA
          : (parsedAmount * processedReserves.tokenA) /
            processedReserves.tokenB;

        return formatUnits(result, decimalsOut);
      } catch (error) {
        console.warn('Error calculating pair amount:', error);
        return '';
      }
    },
    [processedReserves, tokenADecimals, tokenBDecimals]
  );

  // Calculate effective maximums
  const effectiveMaxes = useMemo(() => {
    if (!processedReserves || !tokenABalanceData || !tokenBBalanceData) {
      return { tokenA: '0', tokenB: '0' };
    }

    try {
      // Max based on token A balance
      const maxTokenAFromBalance = tokenABalanceData.value;
      const maxTokenBFromTokenA =
        (maxTokenAFromBalance * processedReserves.tokenB) /
        processedReserves.tokenA;

      // Max based on token B balance
      const maxTokenBFromBalance = tokenBBalanceData.value;
      const maxTokenAFromTokenB =
        (maxTokenBFromBalance * processedReserves.tokenA) /
        processedReserves.tokenB;

      // Take the minimum of both calculations for each token
      const effectiveMaxTokenA =
        maxTokenAFromBalance < maxTokenAFromTokenB
          ? maxTokenAFromBalance
          : maxTokenAFromTokenB;

      const effectiveMaxTokenB =
        maxTokenBFromBalance < maxTokenBFromTokenA
          ? maxTokenBFromBalance
          : maxTokenBFromTokenA;

      return {
        tokenA: formatUnits(effectiveMaxTokenA, tokenADecimals),
        tokenB: formatUnits(effectiveMaxTokenB, tokenBDecimals)
      };
    } catch (error) {
      console.warn('Error calculating effective maximums:', error);
      return { tokenA: '0', tokenB: '0' };
    }
  }, [
    processedReserves,
    tokenABalanceData,
    tokenBBalanceData,
    tokenADecimals,
    tokenBDecimals
  ]);

  // Check if input would exceed available liquidity
  const wouldExceedLiquidity = useCallback(
    (amount: string, isTokenA: boolean): boolean => {
      if (!amount) return false;

      try {
        const maxAmount = isTokenA
          ? effectiveMaxes.tokenA
          : effectiveMaxes.tokenB;
        return parseFloat(amount) > parseFloat(maxAmount);
      } catch {
        return false;
      }
    },
    [effectiveMaxes]
  );

  // Handlers for setting values
  const setTokenAValue = useCallback(
    (value: string) => {
      if (!value) {
        setValues({ tokenA: '', tokenB: '' });
        return;
      }

      if (wouldExceedLiquidity(value, true)) {
        const maxValue = effectiveMaxes.tokenA;
        setValues({
          tokenA: maxValue,
          tokenB: calculatePairAmount(maxValue, true)
        });
        return;
      }

      setValues({
        tokenA: value,
        tokenB: calculatePairAmount(value, true)
      });
    },
    [calculatePairAmount, wouldExceedLiquidity, effectiveMaxes]
  );

  const setTokenBValue = useCallback(
    (value: string) => {
      if (!value) {
        setValues({ tokenA: '', tokenB: '' });
        return;
      }

      if (wouldExceedLiquidity(value, false)) {
        const maxValue = effectiveMaxes.tokenB;
        setValues({
          tokenB: maxValue,
          tokenA: calculatePairAmount(maxValue, false)
        });
        return;
      }

      setValues({
        tokenB: value,
        tokenA: calculatePairAmount(value, false)
      });
    },
    [calculatePairAmount, wouldExceedLiquidity, effectiveMaxes]
  );

  const resetValues = useCallback(() => {
    setValues({ tokenA: '', tokenB: '' });
  }, []);

  return {
    values,
    setTokenAValue,
    setTokenBValue,
    resetValues,
    tokenABalance: tokenABalanceData
      ? formatUnits(tokenABalanceData.value, tokenADecimals)
      : '0',
    tokenBBalance: tokenBBalanceData
      ? formatUnits(tokenBBalanceData.value, tokenBDecimals)
      : '0',
    effectiveMaxTokenA: effectiveMaxes.tokenA,
    effectiveMaxTokenB: effectiveMaxes.tokenB,
    wouldExceedLiquidity,
    isLoading: reserves.status === 'pending'
  };
}
