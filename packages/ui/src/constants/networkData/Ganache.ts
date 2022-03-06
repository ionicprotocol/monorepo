import { SupportedChains } from '@midas-capital/sdk';

import { ChainMetadata } from './index';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.ganache,
  chainIdHex: '0x539',
  name: 'Ganache',
  shortName: 'Ganache',
  img: '/images/hardhat.svg',
  enabled: true,
  supported: true,
  blocksPerMin: 4,
  visible: process.env.NODE_ENV === 'development',
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: ['http://localhost:3000'],
  nativeCurrency: {
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ganache',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/rinkeby.jpg',
    coingeckoId: 'ethereum',
  },
};

const testnet = mainnet;

const chain = { mainnet, testnet };

export default chain;
