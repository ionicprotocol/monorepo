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
import Link from 'next/link';

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
      <body className={'scrollbar-hide font-inter'}>
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

                <div className="relative px-4 pt-[128px] pb-[280px] min-h-screen">
                  <Navbar />
                  <main>{children}</main>
                  <footer
                    className={`absolute bottom-4 right-4 left-4 bg-grayone px-[3%] mt-3 rounded-xl py-10`}
                  >
                    <div className="flex">
                      <div className="flex-initial mr-20">
                        <div className="mb-20">
                          <Link
                            href={'https://ionic.money'}
                            target="_blank"
                            className={`flex items-center  pr-10`}
                          >
                            <img
                              src="/img/logo/logo.png"
                              alt="logo"
                              className={`h-5 `}
                            />
                          </Link>
                        </div>

                        <div className="flex">
                          <Link
                            href={'https://ionic.money'}
                            target="_blank"
                            className={`flex items-center  pr-5`}
                          >
                            <img
                              src="/images/globe.png"
                              alt="logo"
                              className={`h-5 `}
                            />
                          </Link>

                          <Link
                            href={'https://t.me/ionicmoney'}
                            target="_blank"
                            className={`flex items-center  pr-5`}
                          >
                            <img
                              src="/images/tg.png"
                              alt="logo"
                              className={`h-5 `}
                            />
                          </Link>

                          <Link
                            href={'https://twitter.com/ionicmoney'}
                            target="_blank"
                            className={`flex items-center  pr-5`}
                          >
                            <img
                              src="/images/x.png"
                              alt="logo"
                              className={`h-5 `}
                            />
                          </Link>

                          <Link
                            href={'https://discord.gg/FmgedqR9wn'}
                            target="_blank"
                            className={`flex items-center  pr-5`}
                          >
                            <img
                              src="/images/discord.png"
                              alt="logo"
                              className={`h-5 `}
                            />
                          </Link>
                        </div>
                      </div>

                      <div className="flex-initial mr-20">
                        <h4 className="text-lg text-bold mb-2">Resources</h4>

                        <ul className="text-sm">
                          <li className="mb-1">
                            <a
                              href="https://doc.ionic.money/ionic-documentation/audit"
                              target="_blank"
                            >
                              Audit
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://doc.ionic.money/"
                              target="_blank"
                            >
                              Documentation
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://github.com/orgs/ionicprotocol/repositories"
                              target="_blank"
                            >
                              GitHub
                            </a>
                          </li>
                        </ul>
                      </div>

                      <div className="flex-initial mr-20">
                        <h4 className="text-lg text-bold mb-2">Tools</h4>

                        <ul className="text-sm">
                          <li className="mb-1">
                            <a
                              href="https://defillama.com/protocol/ionic-protocol"
                              target="_blank"
                            >
                              DeFi Llama
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </footer>

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
                </div>
              </MultiIonicProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
