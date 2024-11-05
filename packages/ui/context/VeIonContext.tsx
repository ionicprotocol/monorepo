import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { formatEther, parseUnits } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';

import { useIonPrice } from '@ui/hooks/useDexScreenerPrices';
import { useEthPrice } from '@ui/hooks/useEthPrice';
import {
  useTotalLiquidity,
  useStakedLiquidity,
  useLockedLiquidity
} from '@ui/hooks/useLiquidity';
import { useReserves } from '@ui/hooks/useReserves';
import { getToken, getAvailableStakingToken } from '@ui/utils/getStakingTokens';

interface VeIONContextType {
  ionBalance: string;
  veIonBalance: string;
  ethBalance: string;
  getTokenBalance: (token: 'eth' | 'mode' | 'weth') => string;
  isLoading: boolean;
  currentChain: number;
  prices: {
    ionUsd: number;
    veIonUsd: number;
    // Calculated USD values
    ionBalanceUsd: string;
    veIonBalanceUsd: string;
  };
  liquidity: {
    totalLiquidity: number;
    stakedLiquidity: number;
    lockedLiquidity: number;
    isLoading: boolean;
  };
  reserves: {
    eth?: { ion: bigint; token: bigint };
    mode?: { ion: bigint; token: bigint };
    weth?: { ion: bigint; token: bigint };
  };
  calculateTokenAmount: (
    ionAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ) => string;
  calculateIonAmount: (
    tokenAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ) => string;
}

const VeIONContext = createContext<VeIONContextType>({
  ionBalance: '0',
  veIonBalance: '0',
  ethBalance: '0',
  getTokenBalance: () => '0',
  isLoading: true,
  currentChain: 0,
  prices: {
    ionUsd: 0,
    veIonUsd: 0,
    ionBalanceUsd: '0',
    veIonBalanceUsd: '0'
  },
  liquidity: {
    totalLiquidity: 0,
    stakedLiquidity: 0,
    lockedLiquidity: 0,
    isLoading: true
  },
  reserves: {},
  calculateTokenAmount: () => '0',
  calculateIonAmount: () => '0'
});

export function VeIONProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const defaultChainId = useChainId();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [currentChain, setCurrentChain] = useState<number>(defaultChainId);

  const { data: ethPrice = 0 } = useEthPrice();
  const { data: ionPriceData } = useIonPrice({ chainId: currentChain });
  const ionPrice = Number(ionPriceData?.pair?.priceUsd || 0);
  const veIonPrice = ionPrice; // Assuming 1:1 ratio, adjust if different

  // Update chain whenever URL params change
  useEffect(() => {
    const queryChain = searchParams.get('chain');
    const newChain = Number(queryChain || defaultChainId);
    setCurrentChain(newChain);
  }, [searchParams, defaultChainId]);

  // Get token addresses
  const ionTokenAddress = getToken(currentChain);
  // will need to update this to get the correct token address
  const veIonTokenAddress = getAvailableStakingToken(currentChain, 'eth');

  // Fetch balances
  const { data: ionBalance } = useBalance({
    address,
    token: ionTokenAddress,
    chainId: currentChain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const { data: veIonBalance } = useBalance({
    address,
    token: veIonTokenAddress,
    chainId: currentChain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const { data: ethBalanceData } = useBalance({
    address,
    chainId: currentChain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const getTokenBalance = (token: 'eth' | 'mode' | 'weth') => {
    if (token === 'eth') {
      return ethBalanceData ? formatEther(ethBalanceData.value) : '0';
    }
    // Add other token balance fetching logic here if needed
    return '0';
  };

  // Calculate USD values
  const ionBalanceAmount = ionBalance
    ? Number(formatEther(ionBalance.value))
    : 0;
  const veIonBalanceAmount = veIonBalance
    ? Number(formatEther(veIonBalance.value))
    : 0;
  const ionBalanceUsd = (ionBalanceAmount * ionPrice).toFixed(3);
  const veIonBalanceUsd = (veIonBalanceAmount * veIonPrice).toFixed(3);

  const { reserves, isLoading: reservesLoading } = useReserves(currentChain);

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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Add any additional data fetching here
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentChain, address]);

  const totalLiquidity = useTotalLiquidity(ethPrice, ionPrice);
  const stakedLiquidity = useStakedLiquidity({
    address,
    veIonContract: veIonTokenAddress
  });
  const lockedLiquidity = useLockedLiquidity(veIonTokenAddress);

  const value = {
    ionBalance: ionBalance ? formatEther(ionBalance.value) : '0',
    veIonBalance: veIonBalance ? formatEther(veIonBalance.value) : '0',
    ethBalance: ethBalanceData ? formatEther(ethBalanceData.value) : '0',
    getTokenBalance,
    currentChain,
    liquidity: {
      totalLiquidity,
      stakedLiquidity,
      lockedLiquidity,
      isLoading: isLoading || reservesLoading
    },
    prices: {
      ionUsd: ionPrice,
      veIonUsd: veIonPrice,
      ionBalanceUsd,
      veIonBalanceUsd
    },
    reserves,
    calculateTokenAmount,
    calculateIonAmount,
    isLoading: isLoading || reservesLoading
  };

  return (
    <VeIONContext.Provider value={value}>{children}</VeIONContext.Provider>
  );
}

export const useVeIONContext = () => {
  const context = useContext(VeIONContext);
  if (context === undefined) {
    throw new Error('useVeIONContext must be used within a VeIONProvider');
  }
  return context;
};

export default VeIONContext;
