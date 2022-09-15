import { Dappeteer } from '@chainsafe/dappeteer';
import dotenv from 'dotenv';
import { Browser, Page } from 'puppeteer';

import { TestHelper } from '@ui/test/helpers/TestHelper';
import { CreatePoolPage } from '@ui/test/pages/pools/CreatePoolPage';

dotenv.config();

let browser: Browser;
let page: Page;
let metamask: Dappeteer;

let createPoolPage: CreatePoolPage;

const name = 'e2e testing';
const oracle = '0xB641c21124546e1c979b4C1EbF13aB00D43Ee8eA';
const closeFactor = '50';
const liquidationIncentive = '8';

const baseUrl = 'http://localhost:3000/56/create-pool';

jest.retryTimes(1);
jest.setTimeout(600000);

describe('Create Pool:', () => {
  beforeAll(async () => {
    [metamask, page, browser] = await TestHelper.initDappeteer();

    createPoolPage = new CreatePoolPage(page, metamask, baseUrl);

    await page.goto(baseUrl);
    await page.bringToFront();

    await createPoolPage.connectMetamaskWallet();
    await createPoolPage.acceptTerms();
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can create pool`, async () => {
    await page.bringToFront();
    await page.goto(baseUrl);
    await createPoolPage.createPool(name, oracle, closeFactor, liquidationIncentive);
  });
});
