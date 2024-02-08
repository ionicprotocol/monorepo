'use client';
import './globals.css';
// import NextNProgress from "nextjs-progressbar";
import { createWeb3Modal } from '@web3modal/wagmi/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

import Navbar from './_components/Navbar';

import { MultiIonicProvider } from '@ui/context/MultiIonicContext';
import { projectId, wagmiConfig } from '@ui/utils/connectors';
import { WagmiProvider } from 'wagmi';

// Create the new web3 modal
createWeb3Modal({
  wagmiConfig,
  projectId
});

const queryClient = new QueryClient();

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className="dark"
      lang="en"
    >
      <body className={'scrollbar-hide font-inter'}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <MultiIonicProvider>
              <ProgressBar
                color="#3bff89ff"
                height="2px"
                options={{ showSpinner: false }}
                shallowRouting
              />

              <div className="relative px-4 pt-[128px] pb-4 sm:pb-[280px] min-h-screen">
                <Navbar />
                <main>{children}</main>
                <footer
                  className={`sm:absolute bottom-4 right-4 left-4 bg-grayone px-[3%] mt-3 rounded-xl py-4 sm:py-10`}
                >
                  <div className="text-center sm:text-left sm:flex">
                    <div className="flex-initial sm:mr-20">
                      <div className="mb-4 sm:mb-20">
                        <Link
                          className={`flex justify-center sm:justify-start items-center sm:pr-10`}
                          href={'https://ionic.money'}
                          target="_blank"
                        >
                          <Image
                            alt="logo"
                            className={`h-5 `}
                            height="20"
                            src="/img/logo/logo.png"
                            width="80"
                          />
                        </Link>
                      </div>

                      <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
                        <Link
                          className={`flex items-center  pr-5`}
                          href={'https://ionic.money'}
                          target="_blank"
                        >
                          <Image
                            alt="logo"
                            className={`h-5 `}
                            height="20"
                            src="/images/globe.png"
                            width="20"
                          />
                        </Link>

                        <Link
                          className={`flex items-center  pr-5`}
                          href={'https://t.me/ionicmoney'}
                          target="_blank"
                        >
                          <Image
                            alt="logo"
                            className={`h-5 `}
                            height="20"
                            src="/images/tg.png"
                            width="20"
                          />
                        </Link>

                        <Link
                          className={`flex items-center  pr-5`}
                          href={'https://twitter.com/ionicmoney'}
                          target="_blank"
                        >
                          <Image
                            alt="logo"
                            className={`h-5 `}
                            height="20"
                            src="/images/x.png"
                            width="20"
                          />
                        </Link>

                        <Link
                          className={`flex items-center `}
                          href={'https://discord.gg/FmgedqR9wn'}
                          target="_blank"
                        >
                          <Image
                            alt="logo"
                            className={`h-5 `}
                            height="20"
                            src="/images/discord.png"
                            width="20"
                          />
                        </Link>
                      </div>
                    </div>

                    <div className="flex-initial sm:mr-20">
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

                    <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
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
                    error: {
                      style: {
                        background: '#e10000',
                        color: '#fff'
                      }
                    },
                    position: 'bottom-center',
                    style: {
                      background: '#3bff89ff',
                      color: '#000'
                    }
                  }}
                />
              </div>
            </MultiIonicProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
