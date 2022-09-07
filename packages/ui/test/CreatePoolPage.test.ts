import { Dappeteer } from '@chainsafe/dappeteer';
import { chapel } from '@midas-capital/chains';
import { assetSymbols } from '@midas-capital/types';
import dotenv from 'dotenv';
import { Browser, Page } from 'puppeteer';

import { TestHelper } from './helpers/TestHelper';
import { CreatePoolPage } from './pages/pools/CreatePoolPage';

dotenv.config();

let browser: Browser;
let page: Page;
let metamask: Dappeteer;

let createPoolPage: CreatePoolPage;

const name = 'e2e testing';
const oracle = 'MasterPriceOracle';
const closeFactor = '50';
const liquidIcent = '8';

const baseUrl = 'https://testnet.midascapital.xyz/97/create-pool';

jest.retryTimes(1);

describe('Create Pool:', () => {
  beforeAll(async () => {
    [metamask, page, browser] = await TestHelper.initDappeteer();

    createPoolPage = new CreatePoolPage(page, metamask, baseUrl);

    await page.goto(baseUrl);
    await page.bringToFront();

    await createPoolPage.connectMetamaskWallet();
    const wbnb = chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB);
    if (wbnb?.underlying) {
      await createPoolPage.addTokenToMetamask(wbnb.underlying);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can create pool`, async () => {
    await createPoolPage.createPool(name, oracle, closeFactor, liquidIcent);
  });
});
