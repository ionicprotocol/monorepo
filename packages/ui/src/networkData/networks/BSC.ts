import { SupportedChains } from 'sdk';

import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.bsc,
  chainIdHex: '0x38',
  name: 'Binance Smart Chain',
  shortName: 'BSC',
  img: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
  enabled: true,
  supported: true,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'BscScan', url: 'https://bscscan.com' } },
  rpcUrls: { default: 'https://bsc-dataseed.binance.org/' },
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
  rpcUrls: { default: 'https://data-seed-prebsc-1-s1.binance.org:8545/' },
  enabled: true,
  supported: process.env.NODE_ENV === 'development' || !!process.env.NEXT_PUBLIC_SHOW_TESTNETS,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'BscScan(Testnet)', url: 'https://testnet.bscscan.com' } },
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
  testnet: true,
};

const chain = { mainnet, testnet };

export default chain;
