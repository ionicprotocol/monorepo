import { useMemo } from 'react';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import type { VeIONLockData, ChainId } from '@ui/types/veION';

import { useVeIONLocks } from './useVeIONLocks';

// Cache per chain
const chainValidStates: Record<number, VeIONLockData | null> = {
  8453: null, // base
  34443: null, // mode
  10: null, // optimism
  1135: null, // lisk
  [ALL_CHAINS_VALUE]: null // combined state
};

export function useMultiChainVeIONLocks({
  selectedChainId
}: {
  selectedChainId: ChainId;
}): VeIONLockData {
  const baseLocks = useVeIONLocks({
    chainId: 8453
  });

  const modeLocks = useVeIONLocks({
    chainId: 34443
  });

  const liskLocks = useVeIONLocks({
    chainId: 1135
  });

  // const optimismLocks = useVeIONLocks({
  //   address,
  //   veIonContract: VEION_CONTRACTS[10] as Hex,
  //   chainId: 10,
  //   supplyResults
  // });

  return useMemo(() => {
    // Helper to check if we should preserve state
    const shouldPreserveState = (
      currentLocks: VeIONLockData,
      chainId: number
    ): boolean => {
      return (
        !currentLocks.isLoading &&
        currentLocks.myLocks.length === 0 &&
        !!chainValidStates[chainId]?.myLocks.length
      );
    };

    // Helper to update cache if we have valid data
    const updateCacheIfValid = (locks: VeIONLockData, chainId: number) => {
      if (!locks.isLoading && locks.myLocks.length > 0) {
        chainValidStates[chainId] = locks;
      }
    };

    // Get chain-specific or combined locks
    const selectedLocks = (() => {
      if (selectedChainId !== ALL_CHAINS_VALUE) {
        switch (selectedChainId) {
          case 8453:
            if (shouldPreserveState(baseLocks, 8453)) {
              return chainValidStates[8453];
            }
            updateCacheIfValid(baseLocks, 8453);
            return baseLocks;

          case 34443:
            if (shouldPreserveState(modeLocks, 34443)) {
              return chainValidStates[34443];
            }
            updateCacheIfValid(modeLocks, 34443);
            return modeLocks;

          case 1135:
            if (shouldPreserveState(liskLocks, 1135)) {
              return chainValidStates[1135];
            }
            updateCacheIfValid(liskLocks, 1135);
            return liskLocks;

          default:
            return { myLocks: [], delegatedLocks: [], isLoading: false };
        }
      }

      // For ALL_CHAINS_VALUE, combine all chain data
      const combinedLocks = {
        myLocks: [
          ...baseLocks.myLocks,
          ...modeLocks.myLocks,
          ...liskLocks.myLocks
          // ...optimismLocks.myLocks
        ],
        delegatedLocks: [
          ...baseLocks.delegatedLocks,
          ...modeLocks.delegatedLocks,
          ...liskLocks.delegatedLocks
          // ...optimismLocks.delegatedLocks
        ],
        isLoading:
          baseLocks.isLoading || modeLocks.isLoading || liskLocks.isLoading
      };

      if (shouldPreserveState(combinedLocks, ALL_CHAINS_VALUE)) {
        return chainValidStates[ALL_CHAINS_VALUE];
      }

      updateCacheIfValid(combinedLocks, ALL_CHAINS_VALUE);
      return combinedLocks;
    })();

    // Ensure we never return null
    const validLocks: VeIONLockData = selectedLocks || {
      myLocks: [],
      delegatedLocks: [],
      isLoading: false
    };

    return validLocks;
  }, [
    selectedChainId,
    baseLocks,
    modeLocks,
    liskLocks
    // optimismLocks
  ]);
}
