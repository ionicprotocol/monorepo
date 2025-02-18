import { useCallback } from 'react';

import { useAccount, useReadContract, useReadContracts } from 'wagmi';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import { VEION_CONTRACTS } from '@ui/constants/veIon';
import type { ChainId, VeIONLockData } from '@ui/types/veION';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';
import { createVeIONLock } from '@ui/utils/veion/lockUtils';

import { useOracleBatch } from '../ionic/useOracleBatch';
import { useIonPrices } from '../useDexScreenerPrices';
import { useEthPrice } from '../useEthPrice';
import { calculateCurrentEpoch, useVotingStatuses } from './useVotingPeriod';

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
type DelegateesResult = ContractResult<bigint[]>;
type AssetsLockedResult = ContractResult<string[]>;

export function useVeIONLocks({
  chainId
}: {
  chainId: ChainId;
}): VeIONLockData & { refetch: () => Promise<void> } {
  const chainConfig = VEION_CHAIN_CONFIGS[chainId];
  const { data: ethPrice = 0 } = useEthPrice();
  const veIonContract = VEION_CONTRACTS[chainId];
  const { address } = useAccount();

  // Get owned token IDs
  const {
    data: tokenIdsResult,
    refetch: refetchTokenIds,
    isLoading: isLoadingTokenIds
  } = useReadContract({
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
  const {
    data: assetsLockedResults,
    refetch: refetchAssets,
    isLoading: isLoadingAssets
  } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'getAssetsLocked',
      args: [tokenId],
      chainId
    }))
  }) as {
    data: AssetsLockedResult[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  // Get user locks for each token ID and LP type
  const {
    data: userLockResults,
    refetch: refetchUserLocks,
    isLoading: isLoadingUserLocks
  } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: iveIonAbi,
        functionName: 'getUserLock',
        args: [BigInt(tokenId), BigInt(lpType)],
        chainId
      }))
    )
  }) as {
    data: SimpleLockResult[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  // Get balances for each token ID
  const {
    data: balanceResults,
    refetch: refetchBalances,
    isLoading: isLoadingBalances
  } = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: veIonContract,
      abi: iveIonAbi,
      functionName: 'balanceOfNFT',
      args: [tokenId],
      chainId
    }))
  }) as {
    data: SimpleBalanceResult[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  // Get delegatees for each token ID and LP type
  const {
    data: delegateesResults,
    refetch: refetchDelegatees,
    isLoading: isLoadingDelegatees
  } = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) =>
      chainConfig.lpTypes.map((lpType) => ({
        address: veIonContract,
        abi: iveIonAbi,
        functionName: 'getDelegatees',
        args: [tokenId, lpType],
        chainId
      }))
    )
  }) as {
    data: DelegateesResult[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  const { data: supplyResults = [], isLoading: isSupplyLoading } =
    useReadContracts({
      contracts: VEION_CHAIN_CONFIGS[chainId].lpTypes.map((lpType) => ({
        address: VEION_CONTRACTS[chainId],
        abi: iveIonAbi,
        functionName: 's_supply',
        args: [BigInt(lpType)],
        chainId: chainId
      }))
    }) as { data: SupplyResult[]; isLoading: boolean };

  const delegationAmountCalls = tokenIds
    .flatMap((tokenId, tokenIdIndex) =>
      chainConfig.lpTypes.flatMap((lpType, lpTypeIndex) => {
        const delegateesResult =
          delegateesResults?.[
            tokenIdIndex * chainConfig.lpTypes.length + lpTypeIndex
          ];

        return delegateesResult?.status === 'success' && delegateesResult.result
          ? delegateesResult.result.map((delegateeId) => {
              return {
                address: veIonContract,
                abi: iveIonAbi,
                functionName: 's_delegations',
                args: [BigInt(tokenId), delegateeId, lpType],
                chainId
              };
            })
          : [];
      })
    )
    .filter(Boolean);

  const {
    data: delegationAmountResults,
    refetch: refetchDelegationAmounts,
    isLoading: isLoadingDelegationAmounts
  } = useReadContracts({
    contracts: delegationAmountCalls
  }) as {
    data: ContractResult<bigint>[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  const processedDelegateesResults =
    delegateesResults?.map((result, index) => {
      if (result.status !== 'success' || !result.result) return null;

      const delegatedTo = result.result;

      const startIndex = delegateesResults
        .slice(0, index)
        .reduce((acc, prevResult) => {
          return (
            acc +
            (prevResult?.status === 'success'
              ? prevResult.result?.length ?? 0
              : 0)
          );
        }, 0);

      const amounts = delegatedTo.map((delegateeId, i) => {
        const amountResult = delegationAmountResults?.[startIndex + i];

        if (amountResult?.status === 'success' && amountResult.result) {
          return amountResult.result.toString();
        }
        return '0';
      });

      return {
        delegatedTo: result.result,
        readyToDelegate: false,
        delegatedTokenIds: result.result,
        delegatedAmounts: amounts
      };
    }) || [];

  // Get unique token addresses
  const allTokenAddresses = [
    ...new Set(
      assetsLockedResults?.flatMap((result) =>
        result.status === 'success' ? result.result : []
      ) ?? []
    )
  ].filter((address): address is `0x${string}` => address !== undefined);

  // Get prices for all tokens in parallel
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useOracleBatch(
    allTokenAddresses,
    chainId
  );

  // Get ION prices
  const {
    data: ionPrices = {},
    refetch: refetchIonPrices,
    isLoading: isLoadingIonPrices
  } = useIonPrices(chainId === ALL_CHAINS_VALUE ? undefined : [chainId]);
  const ionPrice = ionPrices[chainId] || 0;

  const { votingStatuses, isLoading: isLoadingVotes } = useVotingStatuses(
    chainId.toString(),
    tokenIds
  );

  // Create locks with token prices
  const allLocks = tokenIds.flatMap((tokenId, tokenIndex) => {
    const balanceResult = balanceResults?.[tokenIndex];
    if (balanceResult?.status !== 'success' || !balanceResult.result) {
      return null;
    }

    const [assets, balances, boosts] = balanceResult.result;

    return assets.map((tokenAddress, i) => {
      const delegateesResult =
        processedDelegateesResults[tokenIndex * chainConfig.lpTypes.length + i];

      const hasVoted = votingStatuses[tokenId] || false;
      const currentEpoch = calculateCurrentEpoch();

      return createVeIONLock(tokenAddress, i, tokenId, tokenIndex, {
        supplyResults,
        userLockResults,
        balances,
        boosts,
        chainConfig,
        chainId,
        ionPrice,
        tokenPrice: tokenPrices?.[tokenAddress as `0x${string}`],
        delegation: delegateesResult || undefined,
        ethPrice,
        votingStatus: {
          hasVoted,
          currentEpoch
        }
      });
    });
  });

  // Refetch function
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchTokenIds(),
      refetchAssets(),
      refetchUserLocks(),
      refetchBalances(),
      refetchDelegatees(),
      refetchIonPrices(),
      refetchDelegationAmounts()
    ]);
  }, [
    refetchTokenIds,
    refetchAssets,
    refetchUserLocks,
    refetchBalances,
    refetchDelegatees,
    refetchIonPrices,
    refetchDelegationAmounts
  ]);

  const isLoading =
    isLoadingTokenIds ||
    isLoadingAssets ||
    isLoadingUserLocks ||
    isLoadingBalances ||
    isLoadingDelegatees ||
    isLoadingTokenPrices ||
    isLoadingIonPrices ||
    isLoadingDelegationAmounts ||
    isSupplyLoading ||
    isLoadingVotes;

  return {
    myLocks: allLocks
      .filter((lock): lock is NonNullable<typeof lock> => lock !== null)
      .map((lock) => lock.toTableFormat()),
    delegatedLocks: allLocks
      .filter(
        (lock): lock is NonNullable<typeof lock> =>
          lock !== null &&
          lock.delegation?.delegatedTo !== undefined &&
          lock.delegation.delegatedTo.length > 0
      )
      .map((lock) => lock.toDelegateTableFormat()),
    isLoading,
    refetch
  };
}
