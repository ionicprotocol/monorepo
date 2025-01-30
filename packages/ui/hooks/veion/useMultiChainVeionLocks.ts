import { useMemo } from 'react';

import { ALL_CHAINS_VALUE } from '@ui/components/markets/NetworkSelector';
import { VEION_CONTRACTS } from '@ui/constants/veIon';
import type {
  VeIONLockData,
  ChainId,
  MyVeionData,
  DelegateVeionData
} from '@ui/types/veION';

import { useVeIONLocks } from './useVeIONLocks';

import type { Hex } from 'viem';

export function useMultiChainVeIONLocks({
  address,
  selectedChainId
}: {
  address?: string;
  selectedChainId: ChainId;
}): VeIONLockData {
  // Fetch locks from each chain when ALL_CHAINS_VALUE is selected
  const baseLocks = useVeIONLocks({
    address,
    veIonContract: VEION_CONTRACTS[8453] ?? '0x0',
    chainId: 8453
  });

  const modeLocks = useVeIONLocks({
    address,
    veIonContract: VEION_CONTRACTS[34443] as Hex,
    chainId: 34443
  });

  const optimismLocks = useVeIONLocks({
    address,
    veIonContract: VEION_CONTRACTS[10] as Hex,
    chainId: 10
  });

  // Get locks from selected chain or combine all chains
  return useMemo(() => {
    if (selectedChainId !== ALL_CHAINS_VALUE) {
      switch (selectedChainId) {
        case 8453:
          return baseLocks;
        case 34443:
          return modeLocks;
        case 10:
          return optimismLocks;
        default:
          return { myLocks: [], delegatedLocks: [], isLoading: false };
      }
    }

    // Combine locks from all chains
    const allMyLocks: MyVeionData[] = [
      ...baseLocks.myLocks,
      ...modeLocks.myLocks,
      ...optimismLocks.myLocks
    ];

    const allDelegatedLocks: DelegateVeionData[] = [
      ...baseLocks.delegatedLocks,
      ...modeLocks.delegatedLocks,
      ...optimismLocks.delegatedLocks
    ];

    return {
      myLocks: allMyLocks,
      delegatedLocks: allDelegatedLocks,
      isLoading:
        baseLocks.isLoading || modeLocks.isLoading || optimismLocks.isLoading
    };
  }, [selectedChainId, baseLocks, modeLocks, optimismLocks]);
}
