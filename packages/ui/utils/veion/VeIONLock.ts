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
    start: number;
    end: number;
    duration: number;
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
    totalSupply: bigint,
    tokenPrice: bigint
  ) {
    this.id = id;
    this.chainId = chainId;
    this.lpType = lpType;
    this.lpTokenAddress = lpTokenAddress;

    const now = Date.now();
    const endDate = new Date(Number(raw.end) * 1000);

    // Calculate duration in days
    const durationInDays = Math.floor(
      (Number(raw.end) - Number(raw.start)) / (60 * 60 * 24)
    );

    // Determine boost based on duration
    let boost = 1;
    if (raw.isPermanent) {
      boost = 2; // Permanent lock gets 2x boost
    } else if (durationInDays > 180) {
      // Linear increase from 180 days to 730 days (2 years)
      const minDays = 180;
      const maxDays = 730;
      const minBoost = 1;
      const maxBoost = 2;

      boost =
        minBoost +
        ((durationInDays - minDays) * (maxBoost - minBoost)) /
          (maxDays - minDays);

      boost = Math.min(boost, 2);
    }

    this.raw = {
      lockData: raw,
      boost: BigInt(Math.floor(boost * 1e6)),
      totalSupply
    };

    const { ionPercent, tokenPercent } = getLPRatio(chainId, lpType);
    const nativeCurrency =
      VEION_CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH';

    this.tokensLocked = {
      ratio: `${ionPercent}% ION / ${tokenPercent}% ${nativeCurrency}`,
      token1: 'ION',
      token2: nativeCurrency,
      token1Percent: ionPercent,
      token2Percent: tokenPercent
    };

    // Calculate BLP value using oracle price
    const formattedAmount = formatUnits(raw.amount, 18);

    // Ensure safe BigInt calculations
    const safePriceBigInt = tokenPrice ? BigInt(tokenPrice.toString()) : 0n;
    const valueInUSD =
      safePriceBigInt !== 0n
        ? (raw.amount * safePriceBigInt) / BigInt(1e18)
        : 0n;

    const formattedValue = formatUnits(valueInUSD, 18);
    const numericValue = parseFloat(formattedValue);

    this.lockedBLP = {
      amount: `${formattedAmount} BLP`,
      rawAmount: raw.amount,
      value: `$${numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      })}`,
      valueNum: numericValue,
      start: Number(raw.start),
      end: Number(raw.end),
      duration: Number(raw.end) - Number(raw.start)
    };

    // Set lock expiry info
    this.lockExpires = {
      date: format(endDate, 'dd MMM yyyy'),
      timestamp: Number(raw.end),
      timeLeft: formatDistanceToNow(endDate, { addSuffix: true }),
      isPermanent: raw.isPermanent
    };

    // Calculate voting power
    const votingPowerRaw =
      (raw.amount * BigInt(Math.floor(boost * 1e6))) / BigInt(1e6);

    const votingPowerPercentage =
      totalSupply > 0n
        ? (Number(votingPowerRaw) * 100) / Number(totalSupply)
        : 0;

    const votingPowerAmount = formatUnits(votingPowerRaw, 18);

    this.votingPower = {
      amount: +votingPowerAmount,
      rawAmount: votingPowerRaw,
      percentage: votingPowerPercentage,
      boost
    };

    this.status = {
      isClaimable: Number(raw.end) * 1000 < now,
      isExpired: Number(raw.end) * 1000 < now,
      isLocked: Number(raw.end) * 1000 > now,
      canExtend: !raw.isPermanent
    };

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
      lpTokenAddress: this.lpTokenAddress,
      lockedBLP: {
        amount: this.lockedBLP.amount,
        value: this.lockedBLP.value,
        rawAmount: this.lockedBLP.rawAmount,
        start: this.lockedBLP.start,
        end: this.lockedBLP.end,
        duration: this.lockedBLP.duration
      },
      lockExpires: {
        date: this.lockExpires.date,
        timeLeft: this.lockExpires.timeLeft,
        isPermanent: this.lockExpires.isPermanent
      },
      votingPower: this.votingPower.amount,
      votingBoost: Number(this.votingPower.boost),
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
