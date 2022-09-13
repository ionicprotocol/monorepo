import { Dappeteer } from '@chainsafe/dappeteer';
import { polygon } from '@midas-capital/chains';
import { assetSymbols } from '@midas-capital/types';
import dotenv from 'dotenv';
import { Browser, Page } from 'puppeteer';

import { TestHelper } from '@ui/test/helpers/TestHelper';
import { PoolDetailPage } from '@ui/test/pages/pools/PoolDetailPage';

dotenv.config();

let browser: Browser;
let page: Page;
let metamask: Dappeteer;

let poolDetailPage: PoolDetailPage;

const testUrl = 'http://localhost:3000/137/pool/3';
// const testUrl = process.env.TEST_BASE_URL + '137/pool/3';
const supplyAmount = '1';

jest.retryTimes(1);
jest.setTimeout(600000);

describe('Fund Operation:', () => {
  beforeAll(async () => {
    [metamask, page, browser] = await TestHelper.initDappeteer();

    poolDetailPage = new PoolDetailPage(page, metamask, testUrl);

    await page.goto(testUrl);
    await page.bringToFront();

    await poolDetailPage.connectMetamaskWallet();
    await poolDetailPage.acceptTerms();
    const wMatic = polygon.assets.find((asset) => asset.symbol === assetSymbols.WMATIC);
    if (wMatic?.underlying) {
      await poolDetailPage.addTokenToMetamask(wMatic.underlying);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can supply`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);
    await poolDetailPage.supply(supplyAmount);
  });
});
