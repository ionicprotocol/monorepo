import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import type { Chain } from 'viem';

import { getSupportedChains } from '@ui/utils/networkData';

const supportedChains: Chain[] = Object.values(getSupportedChains()).map(
  (data) => {
    return {
      blockExplorers: data.specificParams.metadata.blockExplorerUrls,
      iconUrl: data.specificParams.metadata.img,
      id: data.chainId,
      name: data.specificParams.metadata.name,
      nativeCurrency: {
        decimals: 18,
        name: data.specificParams.metadata.nativeCurrency.name,
        symbol: data.specificParams.metadata.nativeCurrency.symbol
      },
      network: data.specificParams.metadata.name,
      rpcUrls: data.specificParams.metadata.rpcUrls,
      testnet: data.specificParams.metadata.testnet
    };
  }
);

const metadata = {
  description: 'Ionic Web3Modal Sign In',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  name: 'Ionic Web3Modal',
  url: 'http://localhost:3000'
};

export const projectId = '923645e96d6f05f650d266a32ea7295f';

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedChains as any,
  metadata,
  projectId: projectId,
  transports: supportedChains.reduce(
    (accumulator, currentChain) => ({
      ...accumulator,
      [currentChain.id]: currentChain.rpcUrls.default.http[0]
    }),
    {}
  )
});
