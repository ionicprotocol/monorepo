import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { formatEther } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';

import { getVeIonContract, isVeIonSupported } from '@ui/constants/veIon';
import { useIonPrices } from '@ui/hooks/useDexScreenerPrices';
import { useReserves } from '@ui/hooks/useReserves';
import { useVeIonData } from '@ui/hooks/veion/useVeIONData';
import { useVeIONLocks } from '@ui/hooks/veion/useVeIONLocks';
import type {
  PriceData,
  LiquidityData,
  EmissionsData,
  ReservesData,
  VeIONLockData,
  ChainId
} from '@ui/types/VeIION';
import { getToken } from '@ui/utils/getStakingTokens';

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
  locks: VeIONLockData;

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
  locks: {
    myLocks: [],
    delegatedLocks: [],
    isLoading: true
  },
  isLoading: true
};

const VeIONContext = createContext<VeIONContextType>(defaultContext);

export function VeIONProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const defaultChainId = useChainId();
  const searchParams = useSearchParams();
  const [currentChain, setCurrentChain] = useState<number>(defaultChainId);

  const veIonContract = getVeIonContract(currentChain);
  const isSupported = isVeIonSupported(currentChain);

  const { data: ionPriceData } = useIonPrices([currentChain]);
  const ionPrice = Number(ionPriceData?.[currentChain] || 0);
  const veIonPrice = ionPrice;

  // Update chain whenever URL params change
  useEffect(() => {
    const queryChain = searchParams.get('chain');
    const newChain = Number(queryChain || defaultChainId);
    setCurrentChain(newChain);
  }, [searchParams, defaultChainId]);

  // Get token addresses
  const ionTokenAddress = getToken(currentChain);

  // Fetch balances
  const { data: ionBalance } = useBalance({
    address,
    token: ionTokenAddress,
    chainId: currentChain
  });

  const { data: veIonBalance } = useBalance({
    address,
    token: veIonContract,
    chainId: currentChain
  });

  const { data: ethBalanceData } = useBalance({
    address,
    chainId: currentChain
  });

  const { reserves, isLoading: reservesLoading } = useReserves(currentChain);

  // Use consolidated hooks only if veIon is supported on this chain
  const { liquidity, emissions } = useVeIonData({
    address,
    veIonContract,
    emissionsManagerContract: '0x'
  });

  const locks = useVeIONLocks({
    address,
    veIonContract,
    chainId: currentChain as ChainId
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
    liquidity: isSupported ? liquidity : defaultContext.liquidity,
    emissions: isSupported ? emissions : defaultContext.emissions,
    reserves,
    locks: isSupported ? locks : defaultContext.locks,
    isLoading: reservesLoading || (isSupported && locks.isLoading)
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
