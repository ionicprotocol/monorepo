import { Dappeteer } from '@chainsafe/dappeteer';
import { chapel } from '@midas-capital/chains';
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

const chainId = 56;
const networkName = 'ForkedBSC';
const symbol = 'BNB';
const rpc = 'http://localnode:8545/';

const testUrl = 'http://localhost:3000/56/pool/1';
const supplyAmount = '0.01';
const assetSymbol = assetSymbols.WBNB;

// jest.retryTimes(1);
jest.setTimeout(600000);

describe('Fund Operation in ForkedBSC:', () => {
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
    // add WBNB token
    const asset = chapel.assets.find((asset) => asset.symbol === assetSymbol);
    if (asset?.underlying) {
      await poolDetailPage.addTokenToMetamask(asset.underlying);
    }
  });

  afterAll(async () => {
    browser.close();
  });

  test(`User can supply on pool 1`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);
    await poolDetailPage.supply(assetSymbol, supplyAmount);
  });
});
