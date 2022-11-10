import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { Chain, configureChains, defaultChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { getSupportedChains } from '@ui/utils/networkData';

const supportedChains: Chain[] = Object.values(getSupportedChains()).map((data) => {
  return {
    id: data.chainId,
    name: data.specificParams.metadata.name,
    network: data.specificParams.metadata.name,
    iconUrl: data.specificParams.metadata.img,
    nativeCurrency: {
      name: data.specificParams.metadata.nativeCurrency.name,
      symbol: data.specificParams.metadata.nativeCurrency.symbol,
      decimals: 18,
    },
    rpcUrls: data.specificParams.metadata.rpcUrls,
    blockExplorers: data.specificParams.metadata.blockExplorerUrls,
    testnet: data.specificParams.metadata.testnet,
  };
});

export const { chains, provider } = configureChains(
  supportedChains.length !== 0 ? supportedChains : defaultChains,
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

export const { connectors } = getDefaultWallets({
  appName: 'Midas Capital',
  chains,
});
