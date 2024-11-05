import { formatEther, parseUnits } from 'viem';
import { useBalance } from 'wagmi';

import { useReserves } from '@ui/hooks/useReserves';

import type { Address } from 'viem';

interface TokenCalculationsProps {
  address?: Address;
  chainId: number;
}

export function useTokenCalculations({
  address,
  chainId
}: TokenCalculationsProps) {
  const { reserves } = useReserves(chainId);

  // Fetch ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const getTokenBalance = (token: 'eth' | 'mode' | 'weth') => {
    if (token === 'eth') {
      return ethBalance ? formatEther(ethBalance.value) : '0';
    }
    // Add other token balance fetching logic here if needed
    return '0';
  };

  const calculateTokenAmount = (
    ionAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ): string => {
    const reservePair = reserves[selectedToken];
    if (!reservePair || !ionAmount) return '0';

    try {
      const tokenVal =
        (parseUnits(ionAmount, 18) * reservePair.token) / reservePair.ion;
      return formatEther(tokenVal);
    } catch (error) {
      console.warn('Error calculating token amount:', error);
      return '0';
    }
  };

  const calculateIonAmount = (
    tokenAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ): string => {
    const reservePair = reserves[selectedToken];
    if (!reservePair || !tokenAmount) return '0';

    try {
      const ionVal =
        (parseUnits(tokenAmount, 18) * reservePair.ion) / reservePair.token;
      return formatEther(ionVal);
    } catch (error) {
      console.warn('Error calculating ION amount:', error);
      return '0';
    }
  };

  return {
    getTokenBalance,
    calculateTokenAmount,
    calculateIonAmount
  };
}
