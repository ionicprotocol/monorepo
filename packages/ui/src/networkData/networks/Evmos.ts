import { SupportedChains } from '@midas-capital/sdk';

import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.evmos,
  chainIdHex: '0x2329',
  name: 'Evmos',
  shortName: 'Evmos',
  img: '/images/evmos.png',
  rpcUrls: { default: 'https://eth.bd.evmos.org' },
  blockExplorerUrls: { default: { name: 'Evmos', url: 'https://evm.evmos.org' } },
  enabled: false,
  supported: false,
  blocksPerMin: 20,
  nativeCurrency: {
    name: 'EVMOS',
    symbol: 'EVMOS',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    color: '#000',
    overlayTextColor: '#fff',
    logoURL: '/images/evmos.png',
    coingeckoId: 'evmos',
  },
};

const testnet: ChainMetadata = {
  chainId: SupportedChains.evmos_testnet,
  chainIdHex: '0x2328',
  name: 'Evmos Testnet',
  shortName: 'Evmos Testnet',
  img: '/images/evmos.png',
  rpcUrls: { default: 'https://eth.bd.evmos.dev:8545' },
  enabled: true,
  supported: process.env.NODE_ENV === 'development' || !!process.env.NEXT_PUBLIC_SHOW_TESTNETS,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'Evmos', url: 'https://evm.evmos.dev' } },
  nativeCurrency: {
    name: 'tEVMOS',
    symbol: 'tEVMOS',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    color: '#000',
    overlayTextColor: '#fff',
    logoURL: '/images/evmos.png',
    coingeckoId: 'evmos',
  },
  testnet: true,
};

const chain = { mainnet, testnet };

export default chain;
