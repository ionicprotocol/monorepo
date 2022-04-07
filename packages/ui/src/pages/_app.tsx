import '@styles/index.css';
import { ChakraProvider } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider as WagmiProvider } from 'wagmi';

import CheckConnection from '@components/shared/CheckConnection';
import Layout from '@components/shared/Layout';
import { theme } from '@constants/theme';
import { connectors } from '@utils/connectors';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider autoConnect connectors={connectors}>
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
