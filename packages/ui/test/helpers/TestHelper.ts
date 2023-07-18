import type {
  Dappeteer,
  DappeteerBrowser,
  DappeteerLaunchOptions,
  DappeteerPage
} from '@chainsafe/dappeteer';
import { launch, RECOMMENDED_METAMASK_VERSION, setupMetaMask } from '@chainsafe/dappeteer';

import { BASE_URL } from '@ui/test/constants/index';
import { App } from '@ui/test/pages/App';

export type Network = {
  chainId: number;
  networkName: string;
  rpc: string;
  symbol: string;
};

export class TestHelper {
  public static async init(): Promise<App> {
    const [metamask, page] = await this.initDappeteer();
    const app = new App(page, metamask, BASE_URL);

    return app;
  }

  public static async initDappeteer(
    network?: Network
  ): Promise<[Dappeteer, DappeteerPage, DappeteerBrowser]> {
    const envSeed = process.env.TEST_METAMASK_SEED;
    const envPassword = process.env.TEST_METAMASK_PASSWORD;

    if (!envSeed || !envPassword) {
      throw new Error('SEED or PASSWORD not set.');
    }

    const browser = await this.getBrowser();
    const metamask = await this.getMetamask(browser, envSeed, envPassword, network);
    const page = await this.getPage(browser);

    return [metamask, page, browser];
  }

  private static async getMetamask(
    browser: DappeteerBrowser,
    seed: string,
    pass: string,
    network?: Network
  ): Promise<Dappeteer> {
    let metamask: Dappeteer;

    try {
      metamask = await setupMetaMask(browser, { password: pass, seed: seed });
      if (network) {
        await metamask.switchNetwork(network.networkName);
      }
    } catch (error) {
      throw error;
    }

    return metamask;
  }

  private static async getBrowser(): Promise<DappeteerBrowser> {
    let browser: DappeteerBrowser;
    const options: DappeteerLaunchOptions = {
      metaMaskVersion: RECOMMENDED_METAMASK_VERSION
    };

    try {
      browser = await launch(options);
    } catch (error) {
      console.error('Error occurred launching Puppeteer');
      throw error;
    }

    return browser;
  }

  private static async getPage(browser: DappeteerBrowser): Promise<DappeteerPage> {
    let page: DappeteerPage;

    try {
      page = await browser.newPage();
    } catch (error) {
      console.error('Error occurred creating new page');
      throw error;
    }

    return page;
  }
}
