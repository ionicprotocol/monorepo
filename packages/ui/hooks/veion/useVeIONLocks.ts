import { format, formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import { LpTokenType } from '@ui/types/VeIION';
import type {
  ChainId,
  VeIONTableData,
  VeIONLockData,
  VeIONLockRaw,
  MyVeionData,
  DelegateVeionData
} from '@ui/types/VeIION';

import { useIonPrices } from '../useDexScreenerPrices';
import { useReserves } from '../useReserves';

import { iveIonAbi } from '@ionicprotocol/sdk';

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

// Chain configuration
export const VEION_CHAIN_CONFIGS: Record<
  ChainId,
  { lpTypes: LpTokenType[]; nativeCurrency: string; name?: string }
> = {
  10: {
    // Optimism
    lpTypes: [LpTokenType.OP_ETH, LpTokenType.OP_ION],
    nativeCurrency: 'ETH',
    name: 'Optimism'
  },
  8453: {
    // Base
    lpTypes: [LpTokenType.BASE_ETH, LpTokenType.BASE_ION],
    nativeCurrency: 'ETH',
    name: 'Base'
  },
  34443: {
    // Mode
    lpTypes: [LpTokenType.MODE_ETH, LpTokenType.MODE_ION],
    nativeCurrency: 'MODE',
    name: 'Mode'
  },
  0: {
    // All chains
    lpTypes: [
      LpTokenType.OP_ETH,
      LpTokenType.OP_ION,
      LpTokenType.BASE_ETH,
      LpTokenType.BASE_ION,
      LpTokenType.MODE_ETH,
      LpTokenType.MODE_ION
    ],
    nativeCurrency: 'ETH',
    name: 'All Chains'
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
      const nativeCurrency =
        VEION_CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH';

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
        token2: VEION_CHAIN_CONFIGS[chainId]?.nativeCurrency || 'ETH',
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
  const chainConfig = VEION_CHAIN_CONFIGS[chainId];

  const { data: tokenIdsResult } = useReadContract({
    address: veIonContract,
    abi: iveIonAbi,
    functionName: 'getOwnedTokenIds',
    args: [address as `0x${string}`],
    chainId
  });

  const { reserves, isLoading: reservesLoading } = useReserves(chainId);
  const tokenIds = Array.isArray(tokenIdsResult)
    ? tokenIdsResult.map(String)
    : [];

  // Get user locks
  const { data: userLockResults, isError: lockError } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: iveIonAbi,
        functionName: 'getUserLock',
        args: [BigInt(tokenId), BigInt(lpType)],
        chainId
      }))
    )
  });

  // Get balances and boosts
  const { data: balanceResults, isLoading: locksLoading } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'balanceOfNFT',
      args: [tokenId],
      chainId
    }))
  });

  // Calculate total supply from user locks
  const totalSupply =
    userLockResults?.reduce<bigint>((sum, result) => {
      if (
        result?.status === 'success' &&
        result.result &&
        typeof result.result === 'object'
      ) {
        const lock = result.result as { amount?: bigint };
        return sum + (lock.amount ?? 0n);
      }
      return sum;
    }, 0n) ?? 0n;

  // Get delegatee information
  const { data: delegateesResults } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: iveIonAbi,
        functionName: 'getDelegatees',
        args: [tokenId, lpType],
        chainId
      }))
    )
  });

  const { data: ionPrices = {} } = useIonPrices(
    chainId === ALL_CHAINS_VALUE ? undefined : [chainId]
  );
  const ionPrice = ionPrices[chainId] || 0;

  const allLocks = tokenIds.flatMap((tokenId, tokenIndex) => {
    const balanceResult = balanceResults?.[tokenIndex];
    if (balanceResult?.status !== 'success') return null;

    const [assets, balances, boosts] = balanceResult.result as [
      string[],
      bigint[],
      bigint[]
    ];

    return assets.map((tokenAddress, i) => {
      const userLockResult =
        userLockResults?.[tokenIndex * chainConfig.lpTypes.length + i];
      if (userLockResult?.status !== 'success') return null;

      const userLock = userLockResult.result as {
        start: bigint;
        end: bigint;
        isPermanent: boolean;
      };
      const amount = balances[i];
      const boost = boosts[i];

      const lock: LockedBalance = {
        tokenAddress: tokenAddress as `0x${string}`,
        amount,
        start: userLock.start,
        end: userLock.end,
        isPermanent: userLock.isPermanent,
        boost
      };

      return new VeIONLock(
        tokenId,
        chainId,
        chainConfig.lpTypes[i],
        tokenAddress as `0x${string}`,
        lock,
        reserves[getTokenType(chainId)],
        ionPrice,
        totalSupply
      );
    });
  });

  return {
    myLocks: allLocks
      .filter((lock) => lock && !lock.delegation)
      .map((lock) => lock!.toTableFormat()),
    delegatedLocks: allLocks
      .filter((lock) => lock && lock.delegation)
      .map((lock) => lock!.toDelegateTableFormat()),
    isLoading: locksLoading || reservesLoading
  };
}
