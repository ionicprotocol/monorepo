import type { ChainId } from '@ui/types/VeIION';
import { LpTokenType } from '@ui/types/VeIION';

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
