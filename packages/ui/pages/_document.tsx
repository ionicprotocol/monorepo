import { ColorModeScript } from '@chakra-ui/react';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

import { theme } from '@ui/theme/index';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta
            name="description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Midas Capital" />
          <meta
            property="og:image"
            content="https://d1912tcoux65lj.cloudfront.net/social/social_midas.png"
          />
          <meta
            property="og:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
          />
          <meta
            property="og:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
          />
          <meta
            name="twitter:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          <meta name="twitter:url" content="https://app.midascapital.xyz/" />
          <meta
            name="twitter:image"
            content="https://d1912tcoux65lj.cloudfront.net/social/social_midas.png"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
            rel="stylesheet"
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
          <link
            rel="shortcut icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="shortcut icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="manifest" href="/favicon/site.webmanifest" />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
