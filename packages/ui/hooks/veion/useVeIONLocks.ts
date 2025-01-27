import { useReadContract, useReadContracts } from 'wagmi';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import type { ChainId, VeIONLockData } from '@ui/types/VeIION';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';
import { createVeIONLock } from '@ui/utils/veion/lockUtils';

import { useIonPrices } from '../useDexScreenerPrices';
import { useReserves } from '../useReserves';

import { iveIonAbi } from '@ionicprotocol/sdk';

interface WagmiResult<T> {
  status: 'failure' | 'success';
  result?: T;
  error?: Error;
}

type ContractResult<T> = WagmiResult<T>;
type SimpleBalanceResult = ContractResult<[string[], bigint[], bigint[]]>;
type SimpleLockResult = ContractResult<{
  start: bigint;
  end: bigint;
  isPermanent: boolean;
}>;
type SupplyResult = ContractResult<bigint>;
type DelegateesResult = ContractResult<[string, boolean, number[], string[]]>;

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

  const { data: userLockResults } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: iveIonAbi,
        functionName: 'getUserLock',
        args: [BigInt(tokenId), BigInt(lpType)],
        chainId
      }))
    )
  }) as { data: SimpleLockResult[] | undefined };

  const { data: balanceResults } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'balanceOfNFT',
      args: [tokenId],
      chainId
    }))
  }) as { data: SimpleBalanceResult[] | undefined };

  const { data: supplyResults } = useReadContracts({
    contracts: chainConfig.lpTypes.map((lpType) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 's_supply',
      args: [lpType],
      chainId
    }))
  }) as { data: SupplyResult[] | undefined };

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
  }) as { data: DelegateesResult[] | undefined };

  const { data: ionPrices = {} } = useIonPrices(
    chainId === ALL_CHAINS_VALUE ? undefined : [chainId]
  );
  const ionPrice = ionPrices[chainId] || 0;

  const allLocks = tokenIds.flatMap((tokenId, tokenIndex) => {
    const balanceResult = balanceResults?.[tokenIndex];
    if (balanceResult?.status !== 'success' || !balanceResult.result)
      return null;

    const [assets, balances, boosts] = balanceResult.result;

    return assets.map((tokenAddress, i) => {
      const delegateesResult =
        delegateesResults?.[tokenIndex * chainConfig.lpTypes.length + i];
      const delegation =
        delegateesResult?.status === 'success' && delegateesResult.result
          ? {
              delegatedTo: delegateesResult.result[0],
              readyToDelegate: delegateesResult.result[1],
              delegatedTokenIds: delegateesResult.result[2],
              delegatedAmounts: delegateesResult.result[3]
            }
          : undefined;

      return createVeIONLock(tokenAddress, i, tokenId, tokenIndex, {
        supplyResults,
        userLockResults,
        balances,
        boosts,
        chainConfig,
        chainId,
        reserves,
        ionPrice
        // delegation
      });
    });
  });

  return {
    myLocks: allLocks
      .filter(
        (lock): lock is NonNullable<typeof lock> =>
          lock !== null && !lock.delegation
      )
      .map((lock) => lock.toTableFormat()),
    delegatedLocks: allLocks
      .filter(
        (lock): lock is NonNullable<typeof lock> =>
          lock !== null && !!lock.delegation
      )
      .map((lock) => lock.toDelegateTableFormat()),
    isLoading: reservesLoading
  };
}
