// config/web3.ts
import { createAppKit } from '@reown/appkit';
import {
  base,
  optimism,
  mode,
  bob,
  fraxtal,
  lisk,
  superseed,
  worldchain,
  type AppKitNetwork,
  sonic
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'viem';

import type { Transport } from 'viem';

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

export const camptest: AppKitNetwork = {
  id: 325000,
  name: 'Camp Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-campnetwork.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Camp Testnet Explorer',
      url: 'https://camp-network-testnet.blockscout.com',
      apiUrl: 'https://camp-network-testnet.blockscout.com/api'
    }
  }
};

export const ozeantest: AppKitNetwork = {
  id: 7849306,
  name: 'Ozean Testnet',
  nativeCurrency: { name: 'USDX', symbol: 'USDX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ozean-testnet.rpc.caldera.xyz/http'] }
  },
  blockExplorers: {
    default: {
      name: 'Ozean Testnet Explorer',
      url: 'https://ozean-testnet.explorer.caldera.xyz',
      apiUrl: 'https://ozean-testnet.explorer.caldera.xyz/api'
    }
  }
};

export const soneium: AppKitNetwork = {
  id: 1868,
  name: 'Soneium',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://soneium.rpc.scs.startale.com?apikey=hnUFGYMhADAQ3hFfZ6zIjEbKb6KjoBAq'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'Soneium Explorer',
      url: 'https://xckc3jvrzboyo8w4.blockscout.com',
      apiUrl: 'https://xckc3jvrzboyo8w4.blockscout.com/api'
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
  swellchain,
  camptest,
  ozeantest,
  soneium,
  sonic
];

export const metadata = {
  description: 'Ionic Web3Modal Sign In',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  name: 'Ionic Web3Modal',
  url: 'https://app.ionic.money'
};

export const projectId = '923645e96d6f05f650d266a32ea7295f';

// Create chain-specific transports
const createChainTransport = (network: AppKitNetwork): Transport => {
  const urls = network.rpcUrls.default.http;

  // Create transport for this specific chain
  return http(urls[0], {
    timeout: 10_000,
    retryCount: 3,
    retryDelay: 1000,
    batch: {
      batchSize: 1024 * 1024, // 1MB
      wait: 16 // 16ms
    }
  });
};

// Create transports map with specific transport for each chain
const transports = networks.reduce(
  (acc, network) => {
    acc[network.id as number] = createChainTransport(network);
    return acc;
  },
  {} as Record<number, Transport>
);

// Create a rate-limited wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports
});

export const chainImages = {
  [mode.id]: 'https://icons.llamao.fi/icons/chains/rsz_mode.jpg',
  [bob.id]: 'https://icons.llamao.fi/icons/chains/rsz_bob.jpg',
  [fraxtal.id]: 'https://icons.llamao.fi/icons/chains/rsz_fraxtal.jpg',
  [lisk.id]: 'https://icons.llamao.fi/icons/chains/rsz_lisk.jpg',
  [superseed.id]:
    'https://github.com/superseed-xyz/brand-kit/blob/main/logos-wordmarks/logos/large.png?raw=true',
  [swellchain.id]:
    'https://cdn.prod.website-files.com/63dc9bdf46999ffb2c2f407a/66cc343b8a5fd72920c56ae1_SWELL%20L2.svg',
  [ink.id]: 'https://icons.llamao.fi/icons/chains/rsz_ink.jpg',
  [worldchain.id]:
    'https://worldscan.org/assets/world/images/svg/logos/token-secondary-light.svg?v=24.12.2.0'
};

export const initializeWeb3 = () => {
  createAppKit({
    projectId,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#3bff89ff',
      '--w3m-color-mix': '#0a0a0aff'
    },
    adapters: [wagmiAdapter],
    networks: networks as [AppKitNetwork, ...AppKitNetwork[]],
    metadata,
    chainImages
  });

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
};
