import { Dappeteer } from '@chainsafe/dappeteer';
import { Browser, Page } from 'puppeteer';

import { Config } from '@ui/test//helpers/Config';
import { TestHelper } from '@ui/test/helpers/TestHelper';
import { PoolDetailPage } from '@ui/test/pages/pools/PoolDetailPage';

let browser: Browser;
let page: Page;
let metamask: Dappeteer;
let poolDetailPage: PoolDetailPage;

const { chainId, networkName, symbol, rpc, testUrl, supplyAmount, assetSymbol, asset } =
  Config.fundOperation();

// jest.retryTimes(1);
jest.setTimeout(600000);

describe('Fund Operation:', () => {
  beforeAll(async () => {
    [metamask, page, browser] = await TestHelper.initDappeteer({
      networkName,
      rpc,
      chainId,
      symbol,
    });

    poolDetailPage = new PoolDetailPage(page, metamask, testUrl);

    await page.goto(testUrl);
    await page.bringToFront();
    // connect MM to website
    await poolDetailPage.connectMetamaskWallet();
    // pass terms modal
    await poolDetailPage.acceptTerms();
    // add token
    if (asset?.underlying) {
      await poolDetailPage.addTokenToMetamask(asset.underlying);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can supply on pool`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);
    await poolDetailPage.supply(assetSymbol, supplyAmount);
  });

  test(`User can withdraw on pool`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);
    await poolDetailPage.withdraw(assetSymbol, supplyAmount);
  });
});
