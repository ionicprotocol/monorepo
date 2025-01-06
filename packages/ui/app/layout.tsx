'use client';

import { Suspense } from 'react';

import Script from 'next/script';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';

import Footer from '@ui/components/Footer';
import Navbar from '@ui/components/Navbar';
import { Toaster as ToastProvider } from '@ui/components/ui/toaster';
import { TooltipProvider } from '@ui/components/ui/tooltip';
import { wagmiAdapter, initializeWeb3 } from '@ui/config/web3';
import { MultiIonicProvider } from '@ui/context/MultiIonicContext';

import './globals.css';

initializeWeb3();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * Math.pow(2, attemptIndex), 30000)
    }
  }
});

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
      <Script id="ga-tag">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-PBTG02B74E');`}
      </Script>
      <body className={'scrollbar-hide font-inter'}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any}>
          <QueryClientProvider client={queryClient}>
            <MultiIonicProvider>
              <TooltipProvider>
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
                    <Footer />
                    <ToastProvider />
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
              </TooltipProvider>
            </MultiIonicProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
