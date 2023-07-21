import { ColorModeScript } from '@chakra-ui/react';
import type { DocumentContext } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';

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
          <meta content="index,follow" name="robots" />
          <meta
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
            name="description"
          />

          <meta content="summary_large_image" key="twcard" name="twitter:card" />
          <meta
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
            key="twtitle"
            name="twitter:title"
          />
          <meta
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
            key="twdesc"
            name="twitter:description"
          />
          <meta content="https://ionic.money/" key="twurl" name="twitter:url" />
          <meta
            content="https://d1912tcoux65lj.cloudfront.net/social/preview.png"
            key="twimage"
            name="twitter:image"
          />

          <meta content="website" key="ogtype" property="og:type" />
          <meta content="Ionic Protocol" key="ogsitename" property="og:site_name" />
          <meta
            content="https://d1912tcoux65lj.cloudfront.net/social/preview.png"
            key="ogimage"
            property="og:image"
          />
          <meta
            content="Midas - Money markets for all. Lending and borrowing pools for any asset."
            key="ogtitle"
            property="og:title"
          />
          <meta
            content="Build custom lending and borrowing pools for any group of assets that are isolated from other pools and assets within the protocol. Use any asset as collateral and optimize the capital efficiency of your holdings."
            key="ogdesc"
            property="og:description"
          />

          <link href="https://fonts.googleapis.com" rel="preconnect" />
          <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap"
            rel="stylesheet"
          />

          <link href="/favicon/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
          <link href="/favicon/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
          <link href="/favicon/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
          <link
            href="/favicon/favicon-32x32.png"
            rel="shortcut icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="/favicon/favicon-16x16.png"
            rel="shortcut icon"
            sizes="16x16"
            type="image/png"
          />
          <link href="/favicon/site.webmanifest" rel="manifest" />
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
