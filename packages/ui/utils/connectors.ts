import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import type { Chain } from 'wagmi';
import { configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { getSupportedChains } from '@ui/utils/networkData';

const supportedChains: Chain[] = Object.values(getSupportedChains()).map((data) => {
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
});

export const { chains, provider } = configureChains(supportedChains, [
  publicProvider(),
  jsonRpcProvider({
    rpc: (chain) => ({
      http: chain.rpcUrls.default.http[0]
    })
  })
]);

export const { connectors } = getDefaultWallets({
  appName: 'Ionic Protocol',
  chains,
  projectId: 'Ionic Protocol'
});
