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
          <meta charSet="utf-8" />
          <meta name="robots" content="index,follow" />
          <meta
            name="description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
          />

          <meta name="twitter:card" content="summary_large_image" key="twcard" />
          <meta
            name="twitter:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
            key="twtitle"
          />
          <meta
            name="twitter:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
            key="twdesc"
          />
          <meta name="twitter:url" content="https://app.midascapital.xyz/" key="twurl" />
          <meta
            name="twitter:image"
            content="https://d1912tcoux65lj.cloudfront.net/social/preview.png"
            key="twimage"
          />

          <meta property="og:type" content="website" key="ogtype" />
          <meta property="og:site_name" content="Midas Capital" key="ogsitename" />
          <meta
            property="og:image"
            content="https://d1912tcoux65lj.cloudfront.net/social/preview.png"
            key="ogimage"
          />
          <meta
            property="og:title"
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
            key="ogtitle"
          />
          <meta
            property="og:description"
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
            key="ogdesc"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500&display=swap"
            rel="stylesheet"
          ></link>

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
