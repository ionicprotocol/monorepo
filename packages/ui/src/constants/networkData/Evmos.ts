import { ChainMetadata } from './index';

const mainnet: ChainMetadata = {
  chainId: 9001,
  chainIdHex: '0x2329',
  name: 'Evmos',
  shortName: 'Evmos',
  img: '/images/evmos.png',
  rpcUrls: ['https://eth.bd.evmos.org'],
  blockExplorerUrls: ['https://evm.evmos.org'],
  enabled: false,
  visible: true,
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
  chainId: 9000,
  chainIdHex: '0x2328',
  name: 'Evmos Testnet',
  shortName: 'Evmos Testnet',
  img: '/images/evmos.png',
  rpcUrls: ['https://eth.bd.evmos.dev'],
  enabled: true,
  visible: process.env.NODE_ENV === 'development' || !!process.env.NEXT_PUBLIC_SHOW_TESTNETS,
  supported: true,
  blocksPerMin: 20,
  blockExplorerUrls: ['https://evm.evmos.dev'],
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
};

const chain = { mainnet, testnet };

export default chain;
