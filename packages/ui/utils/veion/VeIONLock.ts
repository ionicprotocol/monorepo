import { format, formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'viem';

import type {
  ChainId,
  LpTokenType,
  VeIONTableData,
  VeIONLockRaw,
  MyVeionData,
  DelegateVeionData,
  Reserves
} from '@ui/types/VeIION';

import { VEION_CHAIN_CONFIGS } from './chainConfig';
import { getLPRatio } from './tokenUtils';

interface LockedBalance {
  tokenAddress: `0x${string}`;
  amount: bigint;
  start: bigint;
  end: bigint;
  isPermanent: boolean;
  boost: bigint;
}

export class VeIONLock implements VeIONTableData {
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

  constructor(
    id: string,
    chainId: ChainId,
    lpType: LpTokenType,
    lpTokenAddress: `0x${string}`,
    raw: LockedBalance,
    reserves: Reserves | undefined,
    ionPrice: number,
    totalSupply: bigint
  ) {
    this.id = id;
    this.chainId = chainId;
    this.lpType = lpType;
    this.lpTokenAddress = lpTokenAddress;

    const now = Date.now();
    const endDate = new Date(Number(raw.end) * 1000);

    // Set raw data
    this.raw = {
      lockData: raw,
      boost: raw.boost,
      totalSupply
    };

    const { ionPercent, tokenPercent } = getLPRatio(chainId, lpType);
    const nativeCurrency =
      VEION_CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH';

    // Calculate token ratios
    this.tokensLocked = {
      ratio: `${ionPercent}% ION / ${tokenPercent}% ${nativeCurrency}`,
      token1: 'ION',
      token2: nativeCurrency,
      token1Percent: ionPercent,
      token2Percent: tokenPercent
    };

    // BLP value calculation (temporary until oracle is set up)
    const formattedAmount = formatUnits(raw.amount, 18);
    this.lockedBLP = {
      amount: `${formattedAmount} BLP`,
      rawAmount: raw.amount,
      value: 'TBD', // Will be updated when oracle is available
      valueNum: 0
    };

    // Set lock expiry info
    this.lockExpires = {
      date: format(endDate, 'dd MMM yyyy'),
      timestamp: Number(raw.end),
      timeLeft: formatDistanceToNow(endDate, { addSuffix: true }),
      isPermanent: raw.isPermanent
    };

    // Set voting power info
    const votingPowerAmount = formatUnits(raw.boost, 18);
    this.votingPower = {
      amount: `${votingPowerAmount} veION`,
      rawAmount: raw.boost,
      percentage:
        totalSupply > 0n
          ? `${((Number(raw.boost) * 100) / Number(totalSupply)).toFixed(2)}% of all`
          : '0% of all',
      boost: raw.boost
    };

    // Set status info
    this.status = {
      isClaimable: Number(raw.end) * 1000 < now,
      isExpired: Number(raw.end) * 1000 < now,
      isLocked: Number(raw.end) * 1000 > now,
      canExtend: !raw.isPermanent
    };

    // Set metadata
    this.metadata = {
      createdAt: Number(raw.start),
      lastUpdated: Number(raw.start),
      transactions: []
    };
  }

  toTableFormat(): MyVeionData {
    return {
      id: this.id,
      chainId: this.chainId,
      tokensLocked: this.tokensLocked.ratio,
      lockedBLP: {
        amount: this.lockedBLP.amount,
        value: this.lockedBLP.value
      },
      lockExpires: {
        date: this.lockExpires.date,
        timeLeft: this.lockExpires.timeLeft
      },
      votingPower: this.votingPower.amount,
      votingPercentage: this.votingPower.percentage,
      enableClaim: this.status.isClaimable
    };
  }

  toDelegateTableFormat(): DelegateVeionData {
    if (!this.delegation) {
      throw new Error('No delegation data available');
    }

    return {
      id: this.id,
      tokensLocked: this.tokensLocked.ratio,
      lockedBLP: {
        amount: this.lockedBLP.amount,
        value: this.lockedBLP.value
      },
      lockExpires: {
        date: this.lockExpires.date,
        timeLeft: this.lockExpires.timeLeft
      },
      votingPower: this.votingPower.amount,
      delegatedTo: this.delegation.delegatedTo,
      readyToDelegate: this.delegation.readyToDelegate,
      chainId: this.chainId,
      lpTokenAddress: this.lpTokenAddress,
      delegatedTokenIds: this.delegation.delegatedTokenIds,
      delegatedAmounts: this.delegation.delegatedAmounts
    };
  }
}
