import '@ui/styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@ui/theme/index';
import { connectors } from '@ui/utils/connectors';
import LogRocket from 'logrocket';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createClient, Provider as WagmiProvider } from 'wagmi';

import CheckConnection from '@ui/components/shared/CheckConnection';
import Layout from '@ui/components/shared/Layout';

const queryClient = new QueryClient();
if (process.env.NODE_ENV !== 'development') {
  LogRocket.init('ylr02p/midas-ui');
}

const client = createClient({
  autoConnect: true,
  connectors,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <CheckConnection>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CheckConnection>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp);
