import { Chain, configureChains, defaultChains } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { getSupportedChains } from '@ui/networkData/index';

const supportedChains: Chain[] = Object.values(getSupportedChains()).map((data) => {
  return {
    id: data.chainId,
    name: data.name,
    network: data.name,
    nativeCurrency: {
      name: data.nativeCurrency.name,
      symbol: data.nativeCurrency.symbol,
      decimals: 18,
    },
    rpcUrls: data.rpcUrls,
    blockExplorers: data.blockExplorerUrls,
    testnet: data.testnet,
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
