import '@styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import LogRocket from 'logrocket';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { createClient, Provider as WagmiProvider } from 'wagmi';

import CheckConnection from '@components/shared/CheckConnection';
import Layout from '@components/shared/Layout';
import { theme } from '@theme/index';
import { connectors } from '@utils/connectors';

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
