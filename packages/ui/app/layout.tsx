'use client';
import './globals.css';
// import NextNProgress from "nextjs-progressbar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';

import Navbar from './_components/Navbar';

import { MultiIonicProvider } from '@ui/context/MultiIonicContext';
import { projectId, wagmiConfig } from '@ui/utils/connectors';

// Create the new web3 modal
createWeb3Modal({
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3bff89ff',
    '--w3m-color-mix': '#0a0a0aff'
  },
  wagmiConfig
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
      <body className={'scrollbar-hide font-inter'}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <MultiIonicProvider>
              <Suspense fallback={<></>}>
                <ProgressBar
                  color="#3bff89ff"
                  height="2px"
                  options={{ showSpinner: false }}
                  shallowRouting
                />
              </Suspense>

              <div className=" w-full relative px-4 pt-[128px] pb-4 sm:pb-[280px] min-h-screen overflow-x-hidden">
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

                    <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
                      <svg
                        className="stroke-2 fill-white"
                        height="30"
                        viewBox="0 0 370.99 127.93"
                        width="100"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m127.92,47.62v-31.17h14.43c2.05,0,3.83.39,5.34,1.18s2.7,1.88,3.56,3.27c.86,1.4,1.29,3.02,1.29,4.85s-.43,3.46-1.29,4.85c-.86,1.4-2.06,2.49-3.58,3.27-1.53.79-3.3,1.18-5.32,1.18h-9.75v12.56h-4.68Zm4.68-16.52h9.26c1.84,0,3.3-.48,4.39-1.45s1.63-2.25,1.63-3.85-.54-2.88-1.63-3.83c-1.08-.95-2.55-1.42-4.39-1.42h-9.26v10.55Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m166,48.07c-2.2,0-4.19-.52-5.99-1.56-1.8-1.04-3.21-2.45-4.25-4.23-1.04-1.78-1.56-3.77-1.56-5.97s.52-4.19,1.56-5.97c1.04-1.78,2.46-3.2,4.25-4.25,1.8-1.05,3.79-1.58,5.99-1.58s4.23.53,6.01,1.58c1.78,1.06,3.19,2.47,4.23,4.25,1.04,1.78,1.56,3.77,1.56,5.97s-.52,4.19-1.56,5.97-2.45,3.19-4.23,4.23-3.78,1.56-6.01,1.56Zm0-3.92c1.4,0,2.66-.35,3.79-1.05,1.13-.7,2.02-1.64,2.67-2.83.65-1.19.98-2.52.98-4.01s-.33-2.77-1-3.94c-.67-1.17-1.56-2.12-2.67-2.83-1.11-.71-2.37-1.07-3.76-1.07s-2.65.36-3.76,1.07c-1.11.71-2,1.65-2.67,2.83-.67,1.17-1,2.49-1,3.94s.33,2.82.98,4.01,1.54,2.13,2.67,2.83,2.39,1.05,3.79,1.05Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m186.71,47.62l-6.32-22.67h4.32l4.41,16.66,5.17-16.66h3.83l5.17,16.66,4.41-16.66h4.19l-6.37,22.67h-4.27l-5.08-16.61-5.12,16.61h-4.32Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m226.34,48.02c-2.23,0-4.24-.52-6.04-1.56-1.8-1.04-3.22-2.45-4.27-4.23-1.05-1.78-1.58-3.77-1.58-5.97s.5-4.13,1.51-5.9c1.01-1.77,2.38-3.18,4.1-4.23,1.72-1.05,3.64-1.58,5.74-1.58s3.98.53,5.61,1.58c1.63,1.06,2.93,2.48,3.9,4.28.96,1.8,1.45,3.82,1.45,6.08v1.25h-17.86c.24,1.25.71,2.36,1.4,3.34.7.98,1.59,1.75,2.67,2.32,1.08.56,2.26.85,3.54.85,1.1,0,2.16-.17,3.18-.51,1.02-.34,1.88-.84,2.56-1.49l2.85,2.81c-1.34,1.01-2.71,1.76-4.12,2.25-1.41.49-2.96.74-4.65.74Zm-7.39-13.63h13.4c-.18-1.19-.59-2.23-1.23-3.14-.64-.91-1.42-1.62-2.36-2.14-.94-.52-1.95-.78-3.05-.78s-2.17.25-3.12.76c-.95.51-1.74,1.21-2.38,2.12-.64.91-1.06,1.97-1.27,3.18Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m241.89,47.62v-22.67h4.45v2.9c.71-1.07,1.6-1.91,2.65-2.52,1.05-.61,2.25-.91,3.59-.91.92.03,1.68.16,2.27.4v4.01c-.42-.18-.85-.3-1.29-.38-.45-.07-.89-.11-1.34-.11-1.31,0-2.47.35-3.48,1.05s-1.81,1.71-2.4,3.05v15.19h-4.45Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m268.87,48.02c-2.23,0-4.24-.52-6.04-1.56-1.79-1.04-3.22-2.45-4.27-4.23-1.06-1.78-1.58-3.77-1.58-5.97s.51-4.13,1.51-5.9c1.01-1.77,2.38-3.18,4.1-4.23,1.72-1.05,3.64-1.58,5.75-1.58s3.98.53,5.61,1.58c1.63,1.06,2.93,2.48,3.9,4.28s1.45,3.82,1.45,6.08v1.25h-17.86c.24,1.25.71,2.36,1.4,3.34.7.98,1.59,1.75,2.67,2.32,1.08.56,2.26.85,3.54.85,1.1,0,2.16-.17,3.18-.51,1.02-.34,1.88-.84,2.56-1.49l2.85,2.81c-1.34,1.01-2.71,1.76-4.12,2.25s-2.96.74-4.65.74Zm-7.39-13.63h13.4c-.18-1.19-.59-2.23-1.22-3.14-.64-.91-1.43-1.62-2.36-2.14-.94-.52-1.95-.78-3.05-.78s-2.17.25-3.12.76c-.95.51-1.74,1.21-2.38,2.12-.64.91-1.06,1.97-1.27,3.18Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m294.88,47.98c-2.11,0-4.04-.52-5.79-1.56-1.75-1.04-3.13-2.44-4.14-4.21-1.01-1.77-1.51-3.75-1.51-5.95s.51-4.17,1.54-5.92c1.02-1.75,2.41-3.15,4.16-4.19,1.75-1.04,3.7-1.56,5.83-1.56,1.25,0,2.45.19,3.61.58,1.16.39,2.23.95,3.21,1.69v-10.42l4.45-.85v32.02h-4.41v-2.18c-1.93,1.69-4.25,2.54-6.95,2.54Zm.58-3.87c1.3,0,2.5-.24,3.58-.71,1.08-.47,2-1.16,2.74-2.05v-10.2c-.74-.83-1.65-1.49-2.74-1.98s-2.28-.73-3.58-.73c-1.43,0-2.72.34-3.88,1.02-1.16.68-2.08,1.61-2.76,2.78-.68,1.17-1.02,2.5-1.02,3.99s.34,2.82,1.02,4.01c.68,1.19,1.6,2.13,2.76,2.83,1.16.7,2.45,1.05,3.88,1.05Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m322.58,47.62v-31.17l4.45-.85v11.49c1.9-1.66,4.2-2.49,6.9-2.49,2.14,0,4.08.52,5.81,1.56,1.74,1.04,3.11,2.43,4.12,4.19,1.01,1.75,1.51,3.73,1.51,5.92s-.51,4.18-1.54,5.95c-1.02,1.77-2.4,3.17-4.14,4.21-1.74,1.04-3.69,1.56-5.86,1.56-1.25,0-2.46-.2-3.63-.6-1.17-.4-2.25-.97-3.23-1.72v1.96h-4.41Zm10.78-3.52c1.45,0,2.75-.34,3.9-1.02,1.14-.68,2.05-1.61,2.74-2.78.68-1.17,1.02-2.5,1.02-3.99s-.34-2.82-1.02-4.01c-.68-1.19-1.6-2.12-2.74-2.81-1.14-.68-2.44-1.02-3.9-1.02-1.28,0-2.47.24-3.56.71-1.1.47-2.02,1.14-2.76,2v10.24c.74.83,1.67,1.48,2.78,1.96,1.11.48,2.29.71,3.54.71Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m351.35,57.2c-.47,0-.92-.02-1.34-.07s-.76-.11-1.02-.2v-3.92c.53.12,1.19.18,1.96.18,2.08,0,3.58-1.11,4.5-3.34l.98-2.18-9.08-22.71h4.94l6.59,17.28,7.3-17.28h4.81l-10.95,25.47c-.71,1.6-1.47,2.9-2.27,3.9-.8.99-1.72,1.72-2.76,2.18-1.04.46-2.26.69-3.65.69Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m143.02,97.41v-8.49h20.13c3.08,0,5.48-.87,7.2-2.62,1.72-1.75,2.59-4.05,2.59-6.9s-.86-5.2-2.59-6.9-4.13-2.55-7.2-2.55h-26.54v42.39h-8.69v-51.17h35.23c2.9,0,5.48.43,7.76,1.28,2.27.85,4.19,2.05,5.76,3.59,1.56,1.54,2.76,3.42,3.59,5.62.83,2.21,1.24,4.69,1.24,7.46s-.42,5.19-1.24,7.42c-.83,2.23-2.03,4.15-3.59,5.77-1.56,1.61-3.48,2.86-5.76,3.76-2.27.9-4.86,1.35-7.76,1.35h-20.13Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m210.01,112.33v-20.03l-26.61-31.14h11.79l19.51,23.13,19.58-23.13h11.17l-26.69,31.14v20.03h-8.75,0Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m275.64,112.33v-42.4h-23.06v-8.77h54.9v8.77h-23.09v42.4h-8.75Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m362.27,61.16h8.72v51.17h-8.72v-51.17Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m324.63,112.33v-22.7h32.45v-7.77h-32.45v-20.7h-8.72v51.17h8.72Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m51.17,0c-9.32,0-18.06,2.49-25.59,6.85-4.82,2.78-9.14,6.33-12.79,10.48C4.83,26.35,0,38.2,0,51.17v38.38l12.79,12.79v-51.17c0-11.36,4.94-21.58,12.79-28.61,3.69-3.3,8.03-5.9,12.79-7.58,4-1.42,8.31-2.19,12.79-2.19,21.19,0,38.38,17.18,38.38,38.38s-17.18,38.38-38.38,38.38v12.79c28.26,0,51.17-22.91,51.17-51.17S79.44,0,51.17,0Z"
                          stroke="currentColor"
                        />
                        <path
                          d="m63.96,51.17c0,7.06-5.73,12.79-12.79,12.79v12.79c14.13,0,25.59-11.46,25.59-25.59s-11.46-25.59-25.59-25.59c-4.66,0-9.03,1.24-12.79,3.43-7.65,4.42-12.79,12.69-12.79,22.16v63.97l11.5,11.5,1.29,1.29V51.17c0-7.06,5.73-12.79,12.79-12.79s12.79,5.73,12.79,12.79Z"
                          stroke="currentColor"
                        />
                      </svg>
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
