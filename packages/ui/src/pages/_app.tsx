import { ChakraProvider, theme } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Layout from '@components/shared/Layout';
import { RariProvider } from '@context/RariContext';

import '@styles/index.css';

const AuthMiddleware = dynamic(() => import('@components/Auth'), {
  ssr: false,
});

const customTheme = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: `'Avenir Next', ${theme.fonts.body}`,
    heading: `'Avenir Next', ${theme.fonts.heading}`,
  },
  colors: {
    ...theme.colors,
    nav: {
      50: '#F0FFF4',
      100: '#41C143',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      500: '#38A169',
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532',
    },
  },
};

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={customTheme}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <RariProvider>
          <Layout>
            <AuthMiddleware />
            <Component {...pageProps} />
          </Layout>
        </RariProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp);
