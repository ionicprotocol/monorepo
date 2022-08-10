import { SupportedChains } from '@midas-capital/types';

import { config } from '@ui/config/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.bsc,
  chainIdHex: '0x38',
  name: 'Binance Smart Chain',
  shortName: 'BSC',
  img: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/bsc.jpg',
  enabled: config.isBscEnabled,
  supported: config.isBscEnabled,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'BscScan', url: 'https://bscscan.com' } },
  rpcUrls: { default: 'https://bsc-dataseed.binance.org/' },
  nativeCurrency: {
    symbol: 'BNB',
    name: 'BSC',
  },
  wrappedNativeCurrency: {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
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
  supported: config.isDevelopment || config.isTestnetEnabled,
  blocksPerMin: 20,
  blockExplorerUrls: { default: { name: 'BscScan(Testnet)', url: 'https://testnet.bscscan.com' } },
  nativeCurrency: {
    symbol: 'BNB',
    name: 'BSC',
  },
  wrappedNativeCurrency: {
    symbol: 'WBNB',
    address: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
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
