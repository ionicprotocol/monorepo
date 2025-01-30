import type { ChainId } from '@ui/types/veION';
import { LpTokenType } from '@ui/types/veION';

export function getTokenType(chainId: ChainId): 'eth' | 'mode' | 'weth' {
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

export const getLPRatio = (chainId: ChainId, lpType: LpTokenType) => {
  // AeroSwap pools are 50-50, Balancer pools are 80-20
  const isBalancer = [
    LpTokenType.OP_ETH,
    LpTokenType.BASE_ETH,
    LpTokenType.MODE_ETH
  ].includes(lpType);

  if (isBalancer) {
    return {
      ionPercent: 80,
      tokenPercent: 20
    };
  }

  return {
    ionPercent: 50,
    tokenPercent: 50
  };
};
