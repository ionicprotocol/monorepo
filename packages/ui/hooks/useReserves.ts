import { formatUnits, parseUnits } from 'viem';
import { useReadContracts } from 'wagmi';

import {
  getReservesABI,
  getReservesArgs,
  getReservesContract
} from '@ui/utils/getStakingTokens';

import type { Abi } from 'viem';

interface Reserves {
  ion: bigint;
  token: bigint;
}

type SupportedToken = 'eth' | 'mode' | 'weth';

export function useReserves(chainId: number) {
  const tokens = ['eth', 'mode', 'weth'] as const;

  const contracts = tokens.map((token) => ({
    abi: getReservesABI(chainId) as Abi,
    address: getReservesContract(chainId),
    args: getReservesArgs(chainId, token as SupportedToken),
    functionName: 'getReserves' as const,
    chainId
  }));

  const { data } = useReadContracts({
    contracts,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const reservesMap: { [key in SupportedToken]?: Reserves } = {};

  data?.forEach((reserve, index) => {
    if (reserve.status === 'success' && reserve.result) {
      const resData = reserve.result as
        | [bigint, bigint, bigint]
        | [bigint, bigint];
      const token = tokens[index];

      if (chainId === 10) {
        // Optimism
        reservesMap[token] = {
          ion: resData[1],
          token: resData[0]
        };
      } else {
        reservesMap[token] = {
          ion: resData[0],
          token: resData[1]
        };
      }
    }
  });

  const calculateTokenAmount = (
    ionAmount: string,
    selectedToken: SupportedToken
  ): string => {
    const reservePair = reservesMap[selectedToken];
    if (!reservePair || !ionAmount) return '0';

    try {
      const tokenVal =
        (parseUnits(ionAmount, 18) * reservePair.token) / reservePair.ion;
      return formatUnits(tokenVal, 18);
    } catch (error) {
      console.warn('Error calculating token amount:', error);
      return '0';
    }
  };

  const calculateIonAmount = (
    tokenAmount: string,
    selectedToken: SupportedToken
  ): string => {
    const reservePair = reservesMap[selectedToken];
    if (!reservePair || !tokenAmount) return '0';

    try {
      const ionVal =
        (parseUnits(tokenAmount, 18) * reservePair.ion) / reservePair.token;
      return formatUnits(ionVal, 18);
    } catch (error) {
      console.warn('Error calculating ION amount:', error);
      return '0';
    }
  };

  return {
    reserves: reservesMap,
    isLoading: !data,
    isError: data?.some((d) => d.status === 'failure'),
    calculateTokenAmount,
    calculateIonAmount
  };
}
