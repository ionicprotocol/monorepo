import '@ui/styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import LogRocket from 'logrocket';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createClient, WagmiConfig } from 'wagmi';

import CheckConnection from '@ui/components/shared/CheckConnection';
import Layout from '@ui/components/shared/Layout';
import { theme } from '@ui/theme/index';
import { connectors } from '@ui/utils/connectors';

const queryClient = new QueryClient();
const isDevelopment = process.env.NODE_ENV === 'development';
if (!isDevelopment) {
  LogRocket.init('ylr02p/midas-ui');
}

const client = createClient({
  autoConnect: true,
  connectors,
});

function MidasDapp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <QueryClientProvider client={queryClient}>
          {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
          <CheckConnection>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CheckConnection>
        </QueryClientProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default appWithTranslation(MidasDapp);
