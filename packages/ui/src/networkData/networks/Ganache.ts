import { SupportedChains } from '@midas-capital/sdk';

import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.ganache,
  chainIdHex: '0x539',
  name: 'Ganache',
  shortName: 'Ganache',
  img: '/images/hardhat.svg',
  enabled: true,
  supported: process.env.NODE_ENV === 'development',
  blocksPerMin: 4,
  rpcUrls: { default: 'http://localhost:8545' },
  blockExplorerUrls: { default: { name: 'Etherscan', url: 'http://localhost:3000' } },
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
  testnet: true,
};

const testnet = mainnet;

const chain = { mainnet, testnet };

export default chain;
