import { utils } from 'ethers';

import type { MorphoRow } from '@ui/types/Earn';

export const morphoVaults: Omit<MorphoRow, 'apy' | 'rewards' | 'tvl'>[] = [
  {
    asset: ['WETH'],
    protocol: 'Morpho',
    strategy: 'Supply',
    network: 'base',
    img: '/img/symbols/32/color/morpho.png',
    link: 'https://app.morpho.org/vault?vault=0x5A32099837D89E3a794a44fb131CBbAD41f87a8C&network=base',
    live: true
  },
  {
    asset: ['USDC'],
    protocol: 'Morpho',
    strategy: 'Supply',
    network: 'base',
    img: '/img/symbols/32/color/morpho.png',
    link: 'https://app.morpho.org/vault?vault=0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e&network=base',
    live: true
  }
];

export const morphoBaseAddresses = {
  tokens: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  vaults: {
    WETH: '0x5A32099837D89E3a794a44fb131CBbAD41f87a8C',
    USDC: '0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e'
  }
} as const;

export const vaultAbi = [
  {
    name: 'deposit',
    type: 'function',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' }
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'withdraw',
    type: 'function',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' }
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'maxWithdraw',
    outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

export const formatTokenAmount = (
  totalAssets: string,
  symbol: string
): number => {
  try {
    const decimals = symbol.includes('WETH') ? 18 : 6;
    const formatted = utils.formatUnits(totalAssets, decimals);
    const tokenAmount = parseFloat(formatted);

    return tokenAmount;
  } catch (error) {
    console.error(`Error formatting TVL for ${symbol}:`, error);
    return 0;
  }
};
