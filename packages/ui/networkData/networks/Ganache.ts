import { SupportedChains } from '@midas-capital/types';

import { config } from '@ui/config/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.ganache,
  chainIdHex: '0x539',
  name: 'Ganache',
  shortName: 'Ganache',
  img: '/images/hardhat.svg',
  enabled: config.isDevelopment,
  supported: config.isDevelopment,
  blocksPerMin: 4,
  rpcUrls: { default: 'http://localhost:8545' },
  blockExplorerUrls: { default: { name: 'Etherscan', url: 'http://localhost:3000' } },
  nativeCurrency: {
    symbol: 'WETH',
    name: 'Ganache',
  },
  wrappedNativeCurrency: {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    name: 'Ganache',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/rinkeby.jpg',
    coingeckoId: 'ethereum',
  },
  testnet: true,
};

const testnet = mainnet;

const chain = { mainnet, testnet };

export default chain;
