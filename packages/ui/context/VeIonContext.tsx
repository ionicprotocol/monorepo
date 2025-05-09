'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { isVeIonSupported } from '@ui/constants/veIon';
import { useIonPrices } from '@ui/hooks/useDexScreenerPrices';
import { useReserves } from '@ui/hooks/useReserves';
import { useEmissionsData } from '@ui/hooks/veion/useEmissionsData';
import { useMultiChainVeIONLocks } from '@ui/hooks/veion/useMultiChainVeionLocks';
import { useVeIonData } from '@ui/hooks/veion/useVeIONData';
import type {
  PriceData,
  LiquidityData,
  ReservesData,
  VeIONLockData,
  ChainId,
  MyVeionData
} from '@ui/types/veION';
import { getToken } from '@ui/utils/getStakingTokens';

// Updated EmissionsData interface for VeIONContext
interface EmissionsData {
  lockedValue: {
    amount: number;
    percentage: number;
  };
  totalDeposits: {
    amount: number;
    usdValue: string;
  };
  collateralBp: bigint;
  collateralPercentageNumeric?: number; // Threshold percentage
  actualRatio?: number; // Actual ratio in percentage
  veIonValue?: string; // veION value in ETH
  veIonBalanceUsd: number; // veION value in USD from contract data
  totalCollateralUsd?: number; // Collateral in USD using same exchange rate
  userCollateral?: string; // User's collateral value as a formatted string
  isUserBlacklisted: boolean | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>;
  whitelistUser: {
    execute: () => Promise<`0x${string}` | void>;
    isPending: boolean;
    isSimulating: boolean;
    canWhitelist: boolean;
  };
}

interface VeIONContextType {
  // Balances
  balances: {
    ion: string;
    veIon: number;
    ethBalance: string;
  };

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
  selectedManagePosition: MyVeionData | null;
  setSelectedManagePosition: (position: MyVeionData | null) => void;
}

const defaultEmissionsData: EmissionsData = {
  lockedValue: {
    amount: 0,
    percentage: 0
  },
  totalDeposits: {
    amount: 0,
    usdValue: '0'
  },
  collateralBp: BigInt(0),
  collateralPercentageNumeric: undefined,
  actualRatio: undefined,
  veIonValue: undefined,
  veIonBalanceUsd: 0,
  totalCollateralUsd: undefined,
  userCollateral: undefined,
  isUserBlacklisted: undefined,
  isLoading: true,
  refetch: async () => ({}),
  whitelistUser: {
    execute: async () => {},
    isPending: false,
    isSimulating: false,
    canWhitelist: false
  }
};

const defaultContext: VeIONContextType = {
  currentChain: 0,
  balances: {
    ion: '0',
    veIon: 0,
    ethBalance: '0'
  },
  prices: {
    ionUsd: 0,
    ionBalanceUsd: '0',
    veIonBalanceUsd: 0
  },
  liquidity: {
    total: 0,
    staked: 0,
    locked: 0,
    isLoading: true
  },
  emissions: defaultEmissionsData,
  reserves: {},
  locks: {
    myLocks: [],
    delegatedLocks: [],
    isLoading: true
  },
  isLoading: true,
  selectedManagePosition: null,
  setSelectedManagePosition: () => {}
};

const VeIONContext = createContext<VeIONContextType>(defaultContext);

export function VeIONProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const defaultChainId = 8453;
  const searchParams = useSearchParams();
  const [currentChain, setCurrentChain] = useState<number>(defaultChainId);
  const [selectedManagePosition, setSelectedManagePosition] =
    useState<MyVeionData | null>(null);

  const isSupported = isVeIonSupported(currentChain);

  const { data: ionPriceData } = useIonPrices([currentChain]);
  const ionPrice = Number(ionPriceData?.[currentChain] || 0);

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

  const { data: ethBalanceData } = useBalance({
    address,
    chainId: currentChain
  });

  const { reserves, isLoading: reservesLoading } = useReserves(currentChain);

  const {
    totalLiquidity,
    lockedLiquidity,
    stakedAmount,
    isLoading: veIonDataLoading
  } = useVeIonData();

  const total =
    totalLiquidity[currentChain as keyof typeof totalLiquidity] || 0;
  const locked =
    lockedLiquidity[currentChain as keyof typeof lockedLiquidity] || 0;
  const staked = stakedAmount[currentChain as keyof typeof stakedAmount] || 0;

  const locks = useMultiChainVeIONLocks({
    selectedChainId: currentChain as ChainId
  });

  // Calculate USD values
  const ionBalanceAmount = ionBalance
    ? Number(formatEther(ionBalance.value))
    : 0;
  const ionBalanceUsd = (ionBalanceAmount * ionPrice).toFixed(2);

  const veIonBalance = locks.myLocks.reduce<number>(
    (acc, lock) => acc + +lock.votingPower,
    0
  );

  const veIonBalanceUsd = locks.myLocks.reduce<number>(
    (acc, lock) => acc + +lock.lockedBLP.value,
    0
  );

  useEffect(() => {
    if (selectedManagePosition) {
      const updatedPosition = locks.myLocks.find(
        (lock) => lock.id === selectedManagePosition.id
      );
      if (
        updatedPosition &&
        JSON.stringify(updatedPosition) !==
          JSON.stringify(selectedManagePosition)
      ) {
        setSelectedManagePosition(updatedPosition);
      }
    }
  }, [locks.myLocks, selectedManagePosition]);

  const veIonPercents = locks.myLocks.reduce<number>(
    (acc, lock) => acc + +lock.votingPercentage,
    0
  );

  const emissionsData = useEmissionsData(currentChain);

  const emissions: EmissionsData = isSupported
    ? {
        lockedValue: {
          amount: veIonBalance,
          percentage: veIonPercents
        },
        totalDeposits: {
          amount: 0,
          usdValue: '0'
        },
        collateralBp: emissionsData.collateralBp || BigInt(0),
        collateralPercentageNumeric: emissionsData.collateralPercentageNumeric,
        actualRatio: emissionsData.actualRatio,
        veIonValue: emissionsData.formattedVeIonValue,
        veIonBalanceUsd: emissionsData.veIonBalanceUsd || 0,
        totalCollateralUsd: emissionsData.totalCollateralUsd,
        userCollateral: emissionsData.formattedTotalCollateral,
        isUserBlacklisted: emissionsData.isUserBlacklisted,
        isLoading: emissionsData.isLoading,
        refetch: emissionsData.refetch,
        whitelistUser: emissionsData.whitelistUser
      }
    : defaultEmissionsData;

  const value = {
    currentChain,
    balances: {
      ion: ionBalance ? formatEther(ionBalance.value) : '0',
      veIon: veIonBalance,
      ethBalance: ethBalanceData ? formatEther(ethBalanceData.value) : '0'
    },
    prices: {
      ionUsd: ionPrice,
      ionBalanceUsd,
      veIonBalanceUsd
    },
    liquidity: {
      total,
      staked,
      locked,
      isLoading: veIonDataLoading
    },
    emissions,
    reserves,
    locks: isSupported ? locks : defaultContext.locks,
    isLoading: reservesLoading || (isSupported && locks.isLoading),
    selectedManagePosition,
    setSelectedManagePosition
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
