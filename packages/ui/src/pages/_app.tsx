import { ChakraProvider } from '@chakra-ui/react';

import CheckConnection from '@ui/components/shared/CheckConnection';

import '@ui/styles/index.css';
import LogRocket from 'logrocket';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createClient, Provider as WagmiProvider } from 'wagmi';

import Layout from '@ui/components/shared/Layout';
import { theme } from '@ui/theme/index';
import { connectors } from '@ui/utils/connectors';

const queryClient = new QueryClient();
if (process.env.NODE_ENV !== 'development') {
  LogRocket.init('ylr02p/midas-ui');
}

const client = createClient({
  autoConnect: true,
  connectors,
});

function MidasDapp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <h1>Deployement works</h1>
          {/* <CheckConnection>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CheckConnection> */}
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MidasDapp);
