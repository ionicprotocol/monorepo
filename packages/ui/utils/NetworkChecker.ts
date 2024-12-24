import {
  base,
  optimism,
  mode,
  bob,
  fraxtal,
  lisk,
  superseed,
  worldchain
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { switchChain } from '@wagmi/core';

import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = '923645e96d6f05f650d266a32ea7295f';

export const ink: AppKitNetwork = {
  id: 57073,
  name: 'Ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-gel.inkonchain.com', 'https://rpc-qnd.inkonchain.com']
    }
  },
  blockExplorers: {
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer.inkonchain.com',
      apiUrl: 'https://api.inkonchain.com'
    }
  }
};

export const swellchain: AppKitNetwork = {
  id: 1923,
  name: 'Swellchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.ankr.com/swell',
        'https://swell-mainnet.alt.technology'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'Swell Explorer',
      url: 'https://explorer.swellnetwork.io',
      apiUrl: 'https://api.swellnetwork.io'
    }
  }
};

export const networks: AppKitNetwork[] = [
  base,
  mode,
  optimism,
  bob,
  fraxtal,
  lisk,
  superseed,
  worldchain,
  ink,
  swellchain
];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

export const handleSwitchOriginChain = async (
  selectedDropdownChain: number,
  walletsChain: number
) => {
  try {
    if (selectedDropdownChain !== walletsChain) {
      await switchChain(wagmiAdapter.wagmiConfig, {
        chainId: selectedDropdownChain
      });
      return true;
    }
    if (selectedDropdownChain === walletsChain) {
      return true;
    }
  } catch (err) {
    return false;
  }
};
