import { SupportedChains } from '@midas-capital/types';

import { config } from '@ui/config/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.evmos,
  chainIdHex: '0x2329',
  name: 'Evmos',
  shortName: 'Evmos',
  img: '/images/evmos.png',
  rpcUrls: { default: 'https://eth.bd.evmos.org' },
  blockExplorerUrls: { default: { name: 'Evmos', url: 'https://evm.evmos.org' } },
  enabled: config.isEvmosEnabled,
  supported: config.isEvmosEnabled,
  blocksPerMin: 20,
  nativeCurrency: {
    symbol: 'EVMOS',
    name: 'EVMOS',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped EVMOS',
    symbol: 'WEVMOS',
    decimals: 18,
    address: '0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D',
    color: '#000',
    overlayTextColor: '#fff',
    logoURL: '/images/evmos.png',
    coingeckoId: 'evmos',
  },
};

const testnet: ChainMetadata = {
  chainId: SupportedChains.evmos,
  chainIdHex: '0x2328',
  name: 'Evmos Testnet',
  shortName: 'Evmos Testnet',
  img: '/images/evmos.png',
  rpcUrls: { default: 'https://eth.bd.evmos.dev:8545' },
  enabled: true,
  supported: config.isDevelopment || config.isTestnetEnabled,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'Evmos', url: 'https://evm.evmos.dev' } },
  nativeCurrency: {
    symbol: 'EVMOS',
    name: 'EVMOS',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped EVMOS',
    symbol: 'WEVMOS',
    decimals: 18,
    address: '0xA30404AFB4c43D25542687BCF4367F59cc77b5d2',
    color: '#000',
    overlayTextColor: '#fff',
    logoURL: '/images/evmos.png',
    coingeckoId: 'evmos',
  },
  testnet: true,
};

const chain = { mainnet, testnet };

export default chain;
