import { format, formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';

import { LpTokenType } from '@ui/types/VeIION';
import type {
  ChainId,
  VeIONTableData,
  VeIONLockData,
  VeIONLockRaw,
  MyVeionData,
  DelegateVeionData
} from '@ui/types/VeIION';

import { useIonPrice } from '../useDexScreenerPrices';
import { useReserves } from '../useReserves';

import { veIonAbi } from '@ionicprotocol/sdk';

// Chain configuration
const CHAIN_CONFIGS: Record<
  ChainId,
  { lpTypes: LpTokenType[]; nativeCurrency: string }
> = {
  10: {
    // Optimism
    lpTypes: [LpTokenType.OP_ETH, LpTokenType.OP_ION],
    nativeCurrency: 'ETH'
  },
  8453: {
    // Base
    lpTypes: [LpTokenType.BASE_ETH, LpTokenType.BASE_ION],
    nativeCurrency: 'ETH'
  },
  34443: {
    // Mode
    lpTypes: [LpTokenType.MODE_ETH, LpTokenType.MODE_ION],
    nativeCurrency: 'MODE'
  }
};

interface LockedBalance {
  tokenAddress: `0x${string}`;
  amount: bigint;
  start: bigint;
  end: bigint;
  isPermanent: boolean;
  boost: bigint;
}

interface Reserves {
  ion: bigint;
  token: bigint;
}

class VeIONLock implements VeIONTableData {
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

    // Calculate token ratios
    if (reserves) {
      const ionAmount = Number(formatUnits(reserves.ion, 18));
      const tokenAmount = Number(formatUnits(reserves.token, 18));
      const total = ionAmount + tokenAmount;
      const ionPercent = (ionAmount / total) * 100;
      const tokenPercent = (tokenAmount / total) * 100;
      const nativeCurrency = CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH';

      this.tokensLocked = {
        ratio: `${ionPercent.toFixed(0)}% ION / ${tokenPercent.toFixed(0)}% ${nativeCurrency}`,
        token1: 'ION',
        token2: nativeCurrency,
        token1Percent: ionPercent,
        token2Percent: tokenPercent
      };
    } else {
      this.tokensLocked = {
        ratio: 'Loading...',
        token1: 'ION',
        token2: CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH',
        token1Percent: 0,
        token2Percent: 0
      };
    }

    // Set BLP values
    const formattedAmount = formatUnits(raw.amount, 18);
    const valueNum = Number(formattedAmount) * ionPrice;
    this.lockedBLP = {
      amount: `${formattedAmount} BLP`,
      rawAmount: raw.amount,
      value: `$${valueNum.toFixed(2)}`,
      valueNum
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

export function useVeIONLocks({
  address,
  veIonContract,
  chainId
}: {
  address?: string;
  veIonContract: `0x${string}`;
  chainId: ChainId;
}): VeIONLockData {
  const chainConfig = CHAIN_CONFIGS[chainId];

  // Get token IDs for current chain
  const { data: tokenIdsResult } = useReadContract({
    address: veIonContract,
    abi: veIonAbi,
    functionName: 'getOwnedTokenIds',
    args: [address as `0x${string}`],
    chainId
  });

  // Get total supply for current chain's LP types
  const { data: totalSupplyResults } = useReadContracts({
    contracts: chainConfig.lpTypes.map((lpType) => ({
      address: veIonContract,
      abi: veIonAbi,
      functionName: 's_supply',
      args: [lpType],
      chainId
    }))
  });

  const tokenIds =
    Array.isArray(tokenIdsResult) && tokenIdsResult.length > 0
      ? (tokenIdsResult as string[])
      : [];

  // Get locks for each token ID and LP type
  const { data: locksResults, isLoading: locksLoading } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: veIonAbi,
        functionName: 'getUserLock',
        args: [tokenId, lpType],
        chainId
      }))
    )
  });

  // Get reserves and price data
  const { reserves, isLoading: reservesLoading } = useReserves(chainId);
  const { data: ionPriceData } = useIonPrice({ chainId });
  const ionPrice = Number(ionPriceData?.pair?.priceUsd || 0);

  // Calculate total supply
  const totalSupply =
    // @ts-ignore
    (totalSupplyResults || [])?.reduce(
      (sum, result) =>
        result.status === 'success' ? sum + (result.result as bigint) : sum,
      0n
    ) ?? 0n;

  // Process locks
  const allLocks = tokenIds.flatMap((tokenId, tokenIndex) =>
    chainConfig.lpTypes
      .map((lpType, lpTypeIndex) => {
        const lockResult =
          locksResults?.[tokenIndex * chainConfig.lpTypes.length + lpTypeIndex];

        if (lockResult?.status !== 'success') return null;

        const lock = lockResult.result as LockedBalance;
        if (!lock || lock.amount <= 0n) return null;

        return new VeIONLock(
          tokenId,
          chainId,
          lpType,
          lock.tokenAddress,
          lock,
          reserves[getTokenType(chainId)],
          ionPrice,
          totalSupply
        );
      })
      .filter((lock): lock is VeIONLock => lock !== null)
  );

  return {
    myLocks: allLocks
      .filter((lock) => !lock.delegation)
      .map((lock) => lock.toTableFormat()),
    delegatedLocks: allLocks
      .filter((lock) => lock.delegation)
      .map((lock) => lock.toDelegateTableFormat()),
    isLoading: locksLoading || reservesLoading
  };
}

function getTokenType(chainId: ChainId): 'eth' | 'mode' | 'weth' {
  switch (chainId) {
    case 8453:
      return 'eth';
    case 34443:
      return 'mode';
    case 10:
      return 'weth';
    default:
      return 'eth';
  }
}
