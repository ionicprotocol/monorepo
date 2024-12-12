// utils/morphoUtils.ts
import type { MorphoRow } from '@ui/types/Earn';

export const morphoVaults: MorphoRow[] = [
  {
    asset: ['WETH'],
    protocol: 'Morpho',
    strategy: 'Vault',
    network: 'Base',
    apr: 0,
    tvl: 0,
    img: '/img/protocols/morpho.png',
    link: '#',
    live: true
  },
  {
    asset: ['USDC'],
    protocol: 'Morpho',
    strategy: 'Vault',
    network: 'Base',
    apr: 0,
    tvl: 0,
    img: '/img/protocols/morpho.png',
    link: '#',
    live: true
  }
];
