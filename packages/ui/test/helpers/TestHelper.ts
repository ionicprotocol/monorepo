import { Dappeteer, launch, LaunchOptions, setupMetamask } from '@chainsafe/dappeteer';
import puppeteer, { Browser, Page } from 'puppeteer';

import { App } from '@ui/test/pages/App';

export class TestHelper {
  public static async init(): Promise<App> {
    const [metamask, page] = await this.initDappeteer();
    const app = new App(page, metamask, process.env.TEST_BASE_URL || 'http://localhost:3000');

    return app;
  }

  public static async initDappeteer(
    seedPhrase = '',
    password = ''
  ): Promise<[Dappeteer, Page, Browser]> {
    let seed: string;
    let pass: string;

    if (seedPhrase !== '' && password !== '') {
      seed = seedPhrase;
      pass = password;
    } else {
      const envSeed = process.env.TEST_SEED;
      const envPassword = process.env.TEST_SEED;
      if (envSeed && envPassword) {
        seed = envSeed;
        pass = envPassword;
      } else {
        throw new Error('SEED and PASSWORD not set.');
      }
    }

    const browser = await this.getBrowser();
    const metamask = await this.getMetamask(browser, seed, pass);
    const page = await this.getPage(browser);

    return [metamask, page, browser];
  }

  private static async getMetamask(
    browser: Browser,
    seed: string,
    pass: string
  ): Promise<Dappeteer> {
    let metamask: Dappeteer;
    const networkName = 'ForkedBSC';

    try {
      metamask = await setupMetamask(browser, { seed: seed, password: pass });
      await metamask.addNetwork({
        networkName,
        rpc: 'http://localnode.com:8545/',
        chainId: 56,
        symbol: 'BNB',
      });
      await metamask.switchNetwork(networkName);
    } catch (error) {
      throw error;
    }

    return metamask;
  }

  private static async getBrowser(): Promise<Browser> {
    let browser: Browser;
    const options: LaunchOptions = {
      metamaskVersion: 'v10.15.0',
      headless: false,
      args: ['--no-sandbox'],
    };

    try {
      browser = await launch(puppeteer, options);
    } catch (error) {
      // console.log('Error occurred launching Puppeteer');
      throw error;
    }

    return browser;
  }

  private static async getPage(browser: Browser): Promise<Page> {
    let page: Page;

    try {
      page = await browser.newPage();

      await page.setDefaultTimeout(180000);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
      );
    } catch (error) {
      // console.log('Error occurred creating new page');
      throw error;
    }

    return page;
  }
}
