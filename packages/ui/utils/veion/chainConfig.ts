import type { ChainId } from '@ui/types/veION';
import { LpTokenType } from '@ui/types/veION';

export const VEION_CHAIN_CONFIGS: Record<
  ChainId,
  { lpTypes: LpTokenType[]; nativeCurrency: string; name?: string }
> = {
  10: {
    // Optimism
    lpTypes: [0],
    nativeCurrency: 'ETH',
    name: 'Optimism'
  },
  8453: {
    // Base
    lpTypes: [2],
    nativeCurrency: 'ETH',
    name: 'Base'
  },
  34443: {
    // Mode
    lpTypes: [0],
    nativeCurrency: 'MODE',
    name: 'Mode'
  },
  0: {
    // All chains
    lpTypes: [0, 2],
    nativeCurrency: 'ETH',
    name: 'All Chains'
  }
};
