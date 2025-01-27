// context

export interface PriceData {
  ionUsd: number;
  veIonUsd: number;
  ionBalanceUsd: string;
  veIonBalanceUsd: string;
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
    usdValue: string;
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
  boost: bigint;
};

export interface VeIONLockData {
  myLocks: MyVeionData[]; // Changed from VeIONTableData[]
  delegatedLocks: DelegateVeionData[]; // Changed from VeIONTableData[]
  isLoading: boolean;
}

export type MyVeionData = {
  id: string;
  chainId: ChainId;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
  enableClaim?: boolean;
  votingPercentage: string;
};

export type DelegateVeionData = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
  delegatedTo: string;
  readyToDelegate: boolean;
  chainId: number;
  lpTokenAddress: string;
  delegatedTokenIds: number[];
  delegatedAmounts: string[];
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
    value: string;
    valueNum: number;
  };

  lockExpires: {
    date: string;
    timestamp: number;
    timeLeft: string;
    isPermanent: boolean;
  };

  votingPower: {
    amount: string;
    rawAmount: bigint;
    percentage: string;
    boost: bigint;
  };

  status: {
    isClaimable: boolean;
    isExpired: boolean;
    isLocked: boolean;
    canExtend: boolean;
  };

  delegation?: {
    delegatedTo: string;
    readyToDelegate: boolean;
    delegatedTokenIds: number[];
    delegatedAmounts: string[];
  };

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
