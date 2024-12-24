import type { ChainId } from '@ui/types/VeIION';

export const VEION_CONTRACTS: Partial<Record<ChainId, `0x${string}`>> = {
  8453: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Base
  34443: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Mode
  10: '0x0000000000000000000000000000000000000000' as `0x${string}` // Optimism
};

export function getVeIonContract(chainId: number): `0x${string}` {
  return VEION_CONTRACTS[chainId as ChainId] ?? '0x';
}

export function isVeIonSupported(chainId: number): boolean {
  return (
    chainId in VEION_CONTRACTS &&
    VEION_CONTRACTS[chainId as ChainId] !==
      '0x0000000000000000000000000000000000000000'
  );
}
