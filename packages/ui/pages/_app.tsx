import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { createClient, WagmiConfig } from 'wagmi';

import Layout from '@ui/components/shared/Layout';
import RainbowKit from '@ui/components/shared/RainbowKitProvider';
import { config } from '@ui/config/index';
import { MultiIonicProvider } from '@ui/context/MultiIonicContext';
import { theme } from '@ui/theme/index';
import { connectors, provider } from '@ui/utils/connectors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      staleTime: Infinity
    }
  }
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider
});

function MidasDapp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <RainbowKit>
          <QueryClientProvider client={queryClient}>
            <MultiIonicProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </MultiIonicProvider>
            {config.isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </RainbowKit>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default appWithTranslation(MidasDapp);
