import type { ChainId, Reserves } from '@ui/types/VeIION';

import { getTokenType } from './tokenUtils';
import { VeIONLock } from './VeIONLock';

import type { VEION_CHAIN_CONFIGS } from './chainConfig';

interface LockedBalance {
  tokenAddress: `0x${string}`;
  amount: bigint;
  start: bigint;
  end: bigint;
  isPermanent: boolean;
  boost: bigint;
}

interface SupplyResult {
  status: 'failure' | 'success';
  result?: bigint;
  error?: Error;
}

interface SimpleLockResult {
  status: 'failure' | 'success';
  result?: {
    start: bigint;
    end: bigint;
    isPermanent: boolean;
  };
  error?: Error;
}

export const createVeIONLock = (
  tokenAddress: string,
  i: number,
  tokenId: string,
  tokenIndex: number,
  {
    supplyResults,
    userLockResults,
    balances,
    boosts,
    chainConfig,
    chainId,
    reserves,
    ionPrice
  }: {
    supplyResults: SupplyResult[] | undefined;
    userLockResults: SimpleLockResult[] | undefined;
    balances: bigint[];
    boosts: bigint[];
    chainConfig: (typeof VEION_CHAIN_CONFIGS)[ChainId];
    chainId: ChainId;
    reserves: Record<string, Reserves>;
    ionPrice: number;
  }
) => {
  const supplyResult = supplyResults?.[i];
  const totalSupply =
    supplyResult?.status === 'success' ? supplyResult.result ?? 0n : 0n;

  const userLockResult =
    userLockResults?.[tokenIndex * chainConfig.lpTypes.length + i];
  if (userLockResult?.status !== 'success' || !userLockResult.result)
    return null;

  const lock: LockedBalance = {
    tokenAddress: tokenAddress as `0x${string}`,
    amount: balances[i],
    boost: boosts[i],
    ...userLockResult.result
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
};
