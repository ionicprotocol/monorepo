import { SupportedChains } from '@midas-capital/sdk';

import { config } from '@ui/config/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';

// const mainnet: ChainMetadata = {
//   chainId: SupportedChains.neon,
//   chainIdHex: '0xE9AC0D6',
//   name: 'Neon EVM Mainnet',
//   shortName: 'Neon EVM Mainnet',
//   img: '/images/neon.svg',
//   enabled: process.env.NEON_EVM_MAINNET === 'true',
//   supported: process.env.NEON_EVM_MAINNET === 'true',
//   blocksPerMin: 20,
//   blockExplorerUrls: { default: { name: 'NeonScan', url: 'https://neonscan.org/' } },
//   rpcUrls: { default: 'https://proxy.mainnet.neonlabs.org/solana' },
//   nativeCurrency: {
//     symbol: 'NEON',
//     name: 'Neon EVM Mainnet',
//   },
//   wrappedNativeCurrency: {
//     symbol: 'WNEON',
//     address: '',
//     name: 'Neon EVM Mainnet',
//     decimals: 18,
//     color: '#627EEA',
//     overlayTextColor: '#fff',
//     logoURL: '/images/neon.svg',
//     coingeckoId: 'solana',
//   },
// };

const devnet: ChainMetadata = {
  chainId: SupportedChains.neon_devnet,
  chainIdHex: '0xE9AC0CE',
  name: 'Neon Devnet',
  shortName: 'Neon Devnet',
  img: '/images/neon.jpg',
  rpcUrls: { default: 'https://proxy.devnet.neonlabs.org/solana' },
  enabled: true,
  supported: config.isDevelopment || config.isTestnetEnabled,
  blocksPerMin: 50,
  blockExplorerUrls: { default: { name: 'NeonScan', url: 'https://neonscan.org/' } },
  nativeCurrency: {
    symbol: 'NEON',
    name: 'Neon Devnet',
  },
  wrappedNativeCurrency: {
    symbol: 'NEON',
    address: '',
    name: 'Neon Devnet',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: '/images/neon.jpg',
    coingeckoId: 'solana',
  },
  testnet: true,
};

const chain = { devnet };

export default chain;
