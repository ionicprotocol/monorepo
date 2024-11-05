import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { formatEther } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';

import { useIonPrice } from '@ui/hooks/useDexScreenerPrices';
import { useReserves } from '@ui/hooks/useReserves';
import { useTokenCalculations } from '@ui/hooks/useTokenCalculations';
import { useVeIonData } from '@ui/hooks/veion/useVeIONData';
import { getToken, getAvailableStakingToken } from '@ui/utils/getStakingTokens';

interface PriceData {
  ionUsd: number;
  veIonUsd: number;
  ionBalanceUsd: string;
  veIonBalanceUsd: string;
}

interface LiquidityData {
  total: number;
  staked: number;
  locked: number;
  isLoading: boolean;
}

interface EmissionsData {
  lockedValue: {
    amount: number;
    usdValue: string;
    percentage: number;
  };
  totalDeposits: {
    amount: number;
    usdValue: string;
  };
  isLoading: boolean;
}

interface ReservesData {
  eth?: { ion: bigint; token: bigint };
  mode?: { ion: bigint; token: bigint };
  weth?: { ion: bigint; token: bigint };
}

interface TokenCalculations {
  getTokenBalance: (token: 'eth' | 'mode' | 'weth') => string;
  calculateTokenAmount: (
    ionAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ) => string;
  calculateIonAmount: (
    tokenAmount: string,
    selectedToken: 'eth' | 'mode' | 'weth'
  ) => string;
}

interface VeIONContextType {
  // Balances
  ionBalance: string;
  veIonBalance: string;
  ethBalance: string;

  // Chain info
  currentChain: number;

  // Data structures
  prices: PriceData;
  liquidity: LiquidityData;
  emissions: EmissionsData;
  reserves: ReservesData;

  // Token calculations
  tokenCalculations: TokenCalculations;

  // Loading state
  isLoading: boolean;
}

const defaultContext: VeIONContextType = {
  ionBalance: '0',
  veIonBalance: '0',
  ethBalance: '0',
  currentChain: 0,
  prices: {
    ionUsd: 0,
    veIonUsd: 0,
    ionBalanceUsd: '0',
    veIonBalanceUsd: '0'
  },
  liquidity: {
    total: 0,
    staked: 0,
    locked: 0,
    isLoading: true
  },
  emissions: {
    lockedValue: {
      amount: 0,
      usdValue: '0',
      percentage: 0
    },
    totalDeposits: {
      amount: 0,
      usdValue: '0'
    },
    isLoading: true
  },
  reserves: {},
  tokenCalculations: {
    getTokenBalance: () => '0',
    calculateTokenAmount: () => '0',
    calculateIonAmount: () => '0'
  },
  isLoading: true
};

const VeIONContext = createContext<VeIONContextType>(defaultContext);

export function VeIONProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const defaultChainId = useChainId();
  const searchParams = useSearchParams();
  const [currentChain, setCurrentChain] = useState<number>(defaultChainId);

  const { data: ionPriceData } = useIonPrice({ chainId: currentChain });
  const ionPrice = Number(ionPriceData?.pair?.priceUsd || 0);
  const veIonPrice = ionPrice;

  // Update chain whenever URL params change
  useEffect(() => {
    const queryChain = searchParams.get('chain');
    const newChain = Number(queryChain || defaultChainId);
    setCurrentChain(newChain);
  }, [searchParams, defaultChainId]);

  // Get token addresses
  const ionTokenAddress = getToken(currentChain);

  // !!!!!! needs to be fixed !!!!!!!
  const veIonTokenAddress = getAvailableStakingToken(currentChain, 'eth');

  // Fetch balances
  const { data: ionBalance } = useBalance({
    address,
    token: ionTokenAddress,
    chainId: currentChain
  });

  const { data: veIonBalance } = useBalance({
    address,
    token: veIonTokenAddress,
    chainId: currentChain
  });

  const { data: ethBalanceData } = useBalance({
    address,
    chainId: currentChain
  });

  const { reserves, isLoading: reservesLoading } = useReserves(currentChain);

  const tokenCalculations = useTokenCalculations({
    address,
    chainId: currentChain
  });

  // Use our new consolidated hook
  const { liquidity, emissions } = useVeIonData({
    address,
    veIonContract: veIonTokenAddress,
    emissionsManagerContract: '0x' // todo
  });

  // Calculate USD values
  const ionBalanceAmount = ionBalance
    ? Number(formatEther(ionBalance.value))
    : 0;
  const veIonBalanceAmount = veIonBalance
    ? Number(formatEther(veIonBalance.value))
    : 0;
  const ionBalanceUsd = (ionBalanceAmount * ionPrice).toFixed(2);
  const veIonBalanceUsd = (veIonBalanceAmount * veIonPrice).toFixed(2);

  const value = {
    ionBalance: ionBalance ? formatEther(ionBalance.value) : '0',
    veIonBalance: veIonBalance ? formatEther(veIonBalance.value) : '0',
    ethBalance: ethBalanceData ? formatEther(ethBalanceData.value) : '0',
    currentChain,
    prices: {
      ionUsd: ionPrice,
      veIonUsd: veIonPrice,
      ionBalanceUsd,
      veIonBalanceUsd
    },
    liquidity,
    emissions,
    reserves,
    tokenCalculations,
    isLoading: reservesLoading
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
