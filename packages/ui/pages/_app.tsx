import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { createClient, WagmiConfig } from 'wagmi';

import Layout from '@ui/components/shared/Layout';
import RainbowKit from '@ui/components/shared/RainbowKitProvider';
import { config } from '@ui/config/index';
import { MultiMidasProvider } from '@ui/context/MultiMidasContext';
import { theme } from '@ui/theme/index';
import { connectors, provider } from '@ui/utils/connectors';

const queryClient = new QueryClient();

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MidasDapp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <RainbowKit>
          <QueryClientProvider client={queryClient}>
            <MultiMidasProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </MultiMidasProvider>
            {config.isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </RainbowKit>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default appWithTranslation(MidasDapp);
