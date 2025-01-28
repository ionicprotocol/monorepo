import { useReadContract, useReadContracts } from 'wagmi';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import type { ChainId, VeIONLockData } from '@ui/types/VeIION';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';
import { createVeIONLock } from '@ui/utils/veion/lockUtils';

import { useOracleBatch } from '../ionic/useOracleBatch';
import { useIonPrices } from '../useDexScreenerPrices';

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
type AssetsLockedResult = ContractResult<string[]>;

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

  // Get owned token IDs
  const { data: tokenIdsResult } = useReadContract({
    address: veIonContract,
    abi: iveIonAbi,
    functionName: 'getOwnedTokenIds',
    args: [address as `0x${string}`],
    chainId
  });

  const tokenIds = Array.isArray(tokenIdsResult)
    ? tokenIdsResult.map(String)
    : [];

  // Get all locked assets for each token ID
  const { data: assetsLockedResults } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'getAssetsLocked',
      args: [tokenId],
      chainId
    }))
  }) as { data: AssetsLockedResult[] | undefined };

  // Get unique token addresses
  const allTokenAddresses = [
    ...new Set(
      assetsLockedResults?.flatMap((result) =>
        result.status === 'success' ? result.result : []
      ) ?? []
    )
  ].filter((address): address is `0x${string}` => address !== undefined);

  // Get prices for all tokens in parallel
  const tokenPrices = useOracleBatch(allTokenAddresses, chainId);

  // Get user locks for each token ID and LP type
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

  // Get balances for each token ID
  const { data: balanceResults } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'balanceOfNFT',
      args: [tokenId],
      chainId
    }))
  }) as { data: SimpleBalanceResult[] | undefined };

  // Get supply for each LP type
  const { data: supplyResults } = useReadContracts({
    contracts: chainConfig.lpTypes.map((lpType) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 's_supply',
      args: [lpType],
      chainId
    }))
  }) as { data: SupplyResult[] | undefined };

  // Get delegatees for each token ID and LP type
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

  // Get ION prices
  const { data: ionPrices = {} } = useIonPrices(
    chainId === ALL_CHAINS_VALUE ? undefined : [chainId]
  );
  const ionPrice = ionPrices[chainId] || 0;

  // Create locks with token prices
  const allLocks = tokenIds.flatMap((tokenId, tokenIndex) => {
    const balanceResult = balanceResults?.[tokenIndex];
    if (balanceResult?.status !== 'success' || !balanceResult.result) {
      return null;
    }

    const [assets, balances, boosts] = balanceResult.result;

    return assets.map((tokenAddress, i) => {
      // Get delegations info
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

      const tokenPrice = tokenPrices.data[tokenAddress as `0x${string}`];

      return createVeIONLock(tokenAddress, i, tokenId, tokenIndex, {
        supplyResults,
        userLockResults,
        balances,
        boosts,
        chainConfig,
        chainId,
        ionPrice,
        tokenPrice
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
    isLoading: false
  };
}
