import { Chain, configureChains, defaultChains } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { getSupportedChains } from '@ui/utils/networkData';

const supportedChains: Chain[] = Object.values(getSupportedChains()).map((data) => {
  return {
    id: data.chainId,
    name: data.specificParams.metadata.name,
    network: data.specificParams.metadata.name,
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

export const connectors = () => {
  return [
    new InjectedConnector({
      chains,
      options: { shimChainChangedDisconnect: true, shimDisconnect: false },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ];
};
