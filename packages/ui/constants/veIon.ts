import type { ChainId, MarketExclusionConfig } from '@ui/types/VeIION';

import { iveIonAbi, iVoterAbi } from '@ionicprotocol/sdk';

export const VEION_CONTRACTS: Partial<Record<ChainId, `0x${string}`>> = {
  8453: '0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27' as `0x${string}`, // Base
  34443: '0x2Abd9eB57Fb7727138f4181B68DA0426B7fd47e8' as `0x${string}`, // Mode
  10: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Optimism
  0: '0x'
};

export const VOTER_CONTRACTS: Partial<Record<ChainId, `0x${string}`>> = {
  8453: '0x669A6F5421dA53696fa06f1043CF127d380f6EB9' as `0x${string}`, // Base
  34443: '0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429' as `0x${string}`, // Mode
  10: '0x0000000000000000000000000000000000000000' as `0x${string}` // Optimism
};

export function getVeIonContract(chainId: number): {
  abi: typeof iveIonAbi;
  address: `0x${string}`;
} {
  return {
    abi: iveIonAbi,
    address: VEION_CONTRACTS[chainId as ChainId] as `0x${string}`
  };
}

export function getVoterContract(chainId: number): {
  abi: typeof iVoterAbi;
  address: `0x${string}`;
} {
  return {
    abi: iVoterAbi,
    address: VOTER_CONTRACTS[chainId as ChainId] as `0x${string}`
  };
}

export function isVeIonSupported(chainId: number): boolean {
  return (
    chainId in VEION_CONTRACTS &&
    VEION_CONTRACTS[chainId as ChainId] !==
      '0x0000000000000000000000000000000000000000'
  );
}

// More explicit naming about what this configuration does
export const EXCLUDED_MARKETS: MarketExclusionConfig = {
  8453: {
    ezETH: {
      borrow: true
    },
    wsuperOETHb: {
      borrow: true
    },
    msETH: {
      supply: true,
      borrow: true
    },
    msUSD: {
      supply: true,
      borrow: true
    },
    'wUSD+': {
      supply: true,
      borrow: true
    }
  },
  34443: {
    ezETH: {
      borrow: true
    }
  }
};
