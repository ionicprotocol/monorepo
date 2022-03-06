import { SupportedChains } from '@midas-capital/sdk';

import { ChainMetadata } from './index';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.bsc,
  chainIdHex: '0x38',
  name: 'Binance Smart Chain',
  shortName: 'BSC',
  img: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
  enabled: true,
  visible: true,
  supported: true,
  blocksPerMin: 20,
  blockExplorerUrls: ['https://bscscan.com'],
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  nativeCurrency: {
    symbol: 'BNB',
    address: '0x0000000000000000000000000000000000000000',
    name: 'BSC',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
    coingeckoId: 'binancecoin',
  },
};

const testnet: ChainMetadata = {
  chainId: SupportedChains.chapel,
  chainIdHex: '0x61',
  name: 'BSC Testnet (Chapel)',
  shortName: 'BSC Testnet',
  img: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  enabled: true,
  visible: process.env.NODE_ENV === 'development' || !!process.env.NEXT_PUBLIC_SHOW_TESTNETS,
  supported: true,
  blocksPerMin: 20,
  blockExplorerUrls: ['https://testnet.bscscan.com'],
  nativeCurrency: {
    symbol: 'TBNB',
    address: '0x0000000000000000000000000000000000000000',
    name: 'BSC',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
    coingeckoId: 'binancecoin',
  },
};

const chain = { mainnet, testnet };

export default chain;
