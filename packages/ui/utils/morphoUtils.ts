// utils/morphoUtils.ts
import type { MorphoRow } from '@ui/types/Earn';

export const morphoVaults: Omit<MorphoRow, 'apr' | 'tvl'>[] = [
  {
    asset: ['WETH'],
    protocol: 'Morpho',
    strategy: 'Supply',
    network: 'base',
    img: '/img/symbols/32/color/morpho.png',
    link: 'https://morpho.org',
    live: true
  },
  {
    asset: ['USDC'],
    protocol: 'Morpho',
    strategy: 'Supply',
    network: 'base',
    img: '/img/symbols/32/color/morpho.png',
    link: 'https://morpho.org',
    live: true
  }
];

export const morphoBaseAddresses = {
  tokens: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  vaults: {
    WETH: '0x9aB2d181E4b87ba57D5eD564D3eF652C4E710707',
    USDC: '0xCd347c1e7d600a9A3e403497562eDd0A7Bc3Ef21'
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
    name: 'maxWithdraw',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'maxAssets', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;
