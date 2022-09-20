import { ColorModeScript } from '@chakra-ui/react';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

import { config } from '@ui/config/index';
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
          {/* HTML Meta Tags */}
          <meta
            name="description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          {/* Twitter Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          {/* <meta property="twitter:domain" content={config.productDomain} /> */}
          {/* <meta property="twitter:url" content={config.productUrl} /> */}
          <meta
            name="twitter:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
          />
          <meta
            name="twitter:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          {/* <meta
            name="twitter:image:src"
            content={`${config.iconServerURL}/social/social_midas.png`}
          /> */}
          {/* Facebook Meta Tags */}
          <meta property="og:url" content={config.productUrl} />
          <meta property="og:type" content="object" />
          <meta
            property="og:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
          />
          <meta property="og:site_name" content="Midas Capital" />
          <meta
            property="og:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          <meta property="og:image" content={`${config.iconServerURL}/social/social_midas.png`} />
          <meta
            property="og:image:alt"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />
          <meta name="robots" content="index" />

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
