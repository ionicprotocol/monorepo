import { SupportedChains } from '@midas-capital/types';

import { config } from '@ui/config/index';
import { ChainMetadata } from '@ui/types/ChainMetaData';

const mainnet: ChainMetadata = {
  chainId: SupportedChains.moonbeam,
  chainIdHex: '0x504',
  name: 'Moonbeam',
  shortName: 'Moonbeam',
  img: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/moonbeam.jpg',
  enabled: config.isMoonbeamEnabled,
  supported: config.isMoonbeamEnabled,
  blocksPerMin: 5,
  blockExplorerUrls: { default: { name: 'Moonbeam', url: 'https://moonscan.io/' } },
  rpcUrls: { default: 'https://rpc.api.moonbeam.network' },
  nativeCurrency: {
    symbol: 'GLMR',
    name: 'Moonbeam',
  },
  wrappedNativeCurrency: {
    symbol: 'WGLMR',
    address: '0xAcc15dC74880C9944775448304B263D191c6077F',
    name: 'Moonbeam',
    decimals: 18,
    color: '#627EEA',
    overlayTextColor: '#fff',
    logoURL: 'https://raw.githubusercontent.com/sushiswap/icons/master/network/moonbeam.jpg',
    coingeckoId: 'moonbeam',
  },
};

const chain = { mainnet };

export default chain;
