// context

import type { Delegation } from '@ui/utils/veion/lockUtils';

import type { Hex } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export interface PriceData {
  ionUsd: number;
  ionBalanceUsd: string;
  veIonBalanceUsd: number;
}

export interface LiquidityData {
  total: number;
  staked: number;
  locked: number;
  isLoading: boolean;
}
export type ChainId = 0 | 10 | 8453 | 34443;

export interface EmissionsData {
  lockedValue: {
    amount: number;
    percentage: number;
  };
  totalDeposits: {
    amount: number;
    usdValue: string;
  };
  isLoading: boolean;
}

export interface ReservesData {
  eth?: { ion: bigint; token: bigint };
  mode?: { ion: bigint; token: bigint };
  weth?: { ion: bigint; token: bigint };
}

export interface TokenCalculations {
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

// Enumeration for possible LP token types
export enum LpTokenType {
  OP_ETH = 0,
  OP_ION = 1,
  BASE_ETH = 2,
  BASE_ION = 3,
  MODE_ETH = 4,
  MODE_ION = 5
}

// Raw lock data from the contract

export type VeIONLockRaw = {
  tokenAddress: `0x${string}`;
  amount: bigint;
  start: bigint;
  end: bigint;
  isPermanent: boolean;
};

export interface VeIONLockData {
  myLocks: MyVeionData[];
  delegatedLocks: DelegateVeionData[];
  isLoading: boolean;
  refetch?: () => Promise<any>;
}

export type MyVeionData = {
  id: string;
  chainId: ChainId;
  tokensLocked: string;
  lpTokenAddress: Hex;
  lockedBLP: {
    amount: string;
    value: number;
    rawAmount: bigint;
    start: number;
    end: number;
    duration: number;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
    isPermanent: boolean;
  };
  votingPower: number;
  votingBoost: number;
  enableClaim?: boolean;
  votingPercentage: number;
  votingStatus: {
    hasVoted: boolean;
    currentEpoch: number;
  };
};

export type DelegateVeionData = {
  id: string;
  chainId: ChainId;
  position: string;
  tokensLocked: string;
  lpTokenAddress: string;
  lockedBLP: {
    amount: string;
    value: number;
    rawAmount: bigint;
    start: number;
    end: number;
    duration: number;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
    isPermanent: boolean;
  };
  votingPower: number;
  votingBoost: number;
  votingPercentage: number;
  delegation: Delegation;
};

export interface VeIONTableData {
  id: string;
  chainId: ChainId;
  lpType: LpTokenType;
  lpTokenAddress: `0x${string}`;

  tokensLocked: {
    ratio: string;
    token1: string;
    token2: string;
    token1Percent: number;
    token2Percent: number;
  };

  lockedBLP: {
    amount: string;
    rawAmount: bigint;
    value: number;
    valueNum: number;
  };

  lockExpires: {
    date: string;
    timestamp: number;
    timeLeft: string;
    isPermanent: boolean;
  };

  votingPower: {
    amount: number;
    rawAmount: bigint;
    percentage: number;
    boost: number;
  };

  status: {
    isClaimable: boolean;
    isExpired: boolean;
    isLocked: boolean;
    canExtend: boolean;
  };

  delegation?: Delegation;

  metadata: {
    createdAt: number;
    lastUpdated: number;
    transactions: string[];
  };

  raw: {
    lockData: VeIONLockRaw;
    boost: bigint;
    totalSupply: bigint;
  };

  toTableFormat(): MyVeionData;
  toDelegateTableFormat(): DelegateVeionData;
}

export const isVeIONTableData = (data: any): data is VeIONTableData => {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.chainId === 'number' &&
    typeof data.lpTokenAddress === 'string' &&
    typeof data.tokensLocked === 'object' &&
    typeof data.lockedBLP === 'object' &&
    typeof data.lockExpires === 'object' &&
    typeof data.votingPower === 'object'
  );
};

type MarketSideConfig = {
  supply?: boolean;
  borrow?: boolean;
};

type ChainAssetConfig = {
  [assetSymbol: string]: MarketSideConfig;
};

export type MarketExclusionConfig = {
  [chainId: number]: ChainAssetConfig;
};

export interface Reserves {
  ion: bigint;
  token: bigint;
}

export interface LockedBalance {
  tokenAddress: `0x${string}`;
  amount: bigint;
  start: bigint;
  end: bigint;
  isPermanent: boolean;
  boost: bigint;
}

export type VoteMarketRow = {
  asset: string;
  underlyingToken: Hex;
  side: MarketSide;
  marketAddress: `0x${string}`;
  currentAmount: string;
  incentives: {
    balanceUSD: number;
    tokens: {
      tokenSymbol: string;
      tokenAmount: number;
      tokenAmountUSD: number;
    }[];
  };
  totalVotes: {
    percentage: number;
    limit: number;
  };
  myVotes: {
    percentage: number;
    value: number;
  };
  veAPR: number;
  voteValue: string;
  apr: {
    supplyAPR?: number;
    borrowAPR?: number;
    supplyRewards?: FlywheelReward[];
    borrowRewards?: FlywheelReward[];
    nativeAssetYield?: number;
    supplyAPRTotal?: number;
    borrowAPRTotal?: number;
    cTokenAddress: `0x${string}`;
    comptrollerAddress: `0x${string}`;
  };
};

export enum MarketSide {
  Supply = 0,
  Borrow = 1
}
