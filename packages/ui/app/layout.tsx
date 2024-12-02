'use client';

// import NextNProgress from "nextjs-progressbar";
import { Suspense } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

import { createAppKit } from '@reown/appkit';
import {
  base,
  optimism,
  mode,
  bob,
  fraxtal,
  lisk
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';

import { MultiIonicProvider } from '@ui/context/MultiIonicContext';

import Navbar from './_components/Navbar';
import './globals.css';

const metadata = {
  description: 'Ionic Web3Modal Sign In',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  name: 'Ionic Web3Modal',
  url: 'https://app.ionic.money'
};

export const networks = [base, mode, optimism, bob, fraxtal, lisk];

export const projectId = '923645e96d6f05f650d266a32ea7295f';

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// Create the new web3 modal
createAppKit({
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3bff89ff',
    '--w3m-color-mix': '#0a0a0aff'
  },
  adapters: [wagmiAdapter],
  networks: networks as any,
  metadata,
  chainImages: {
    [mode.id]: 'https://icons.llamao.fi/icons/chains/rsz_mode.jpg',
    [bob.id]: 'https://icons.llamao.fi/icons/chains/rsz_bob.jpg',
    [fraxtal.id]: 'https://icons.llamao.fi/icons/chains/rsz_fraxtal.jpg'
  }
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-PBTG02B74E"
      />
      <Script id="ga-tag">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-PBTG02B74E');`}
      </Script>
      <Script id="hotjar">
        {`(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:5102778,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
      </Script>
      <body className={'scrollbar-hide font-inter '}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <MultiIonicProvider>
              <Suspense fallback={<></>}>
                <ProgressBar
                  color="#3bff89ff"
                  height="2px"
                  options={{ showSpinner: false }}
                  shallowRouting
                />

                <div className="relative px-4 overflow-x-hidden pt-24 md:pt-[128px] pb-4 sm:pb-[280px] min-h-screen w-[100vw]">
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
                              rel="noreferrer"
                            >
                              Audit
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://doc.ionic.money/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Documentation
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://github.com/orgs/ionicprotocol/repositories"
                              target="_blank"
                              rel="noreferrer"
                            >
                              GitHub
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://status.ionic.money/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Status
                            </a>
                          </li>
                        </ul>
                      </div>

                      <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
                        <h4 className="text-lg text-bold mb-2">Tools</h4>

                        <ul className="text-sm">
                          <li className="mb-1">
                            <a
                              href="https://app.anthias.xyz/protocols/ionic/ionic_v1_mode/positions"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Analytics
                            </a>
                          </li>
                          <li className="mb-1">
                            <a
                              href="https://defillama.com/protocol/ionic-protocol"
                              target="_blank"
                              rel="noreferrer"
                            >
                              DeFi Llama
                            </a>
                          </li>
                          <li className="mb-1.5">
                            <a
                              href="https://dune.com/mrwildcat/ionic-protocol"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Dune
                            </a>
                          </li>
                          <li className="mb-1.5">
                            <a
                              href="https://id.ionic.money/#/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              ID
                            </a>
                          </li>
                          <li className="mb-1.5">
                            <a
                              href="https://linktr.ee/ionicmoney"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Linktree
                            </a>
                          </li>
                        </ul>
                      </div>

                      <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
                        <Image
                          alt="logo"
                          height={30}
                          src="/img/pyth.svg"
                          width={100}
                        />
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
              </Suspense>
            </MultiIonicProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
