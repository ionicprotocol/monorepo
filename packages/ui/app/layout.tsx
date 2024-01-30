'use client';
import './globals.css';
// import NextNProgress from "nextjs-progressbar";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import '@rainbow-me/rainbowkit/styles.css';

import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import Navbar from './_components/Navbar';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { getSupportedChains } from '@ui/utils/networkData';
import {
  MultiIonicContext,
  MultiIonicProvider
} from '@ui/context/MultiIonicContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

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
const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: chain.rpcUrls.default.http[0]
    })
  })
]);

const { connectors } = getDefaultWallets({
  appName: 'Ionic Money',
  chains,
  projectId: '923645e96d6f05f650d266a32ea7295f'
});

const wagmiConfig = createClient({
  autoConnect: true,
  connectors,
  provider
});

const queryClient = new QueryClient();

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={'p-4 pt-12 scrollbar-hide font-inter'}>
        <WagmiConfig client={wagmiConfig}>
          <RainbowKitProvider
            chains={chains}
            theme={darkTheme({
              accentColor: '#3bff89ff',
              accentColorForeground: 'black'
            })}
          >
            <QueryClientProvider client={queryClient}>
              <MultiIonicProvider>
                <ProgressBar
                  height="2px"
                  color="#3bff89ff"
                  options={{ showSpinner: false }}
                  shallowRouting
                />
                <Navbar />
                {children}
                <Toaster
                  toastOptions={{
                    position: 'bottom-center',
                    style: {
                      color: '#000',
                      background: '#3bff89ff'
                    },
                    error: {
                      style: {
                        color: '#fff',
                        background: '#e10000'
                      }
                    }
                  }}
                />
              </MultiIonicProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
