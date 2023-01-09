import { Dappeteer, DappeteerBrowser, DappeteerPage } from '@chainsafe/dappeteer';
import dotenv from 'dotenv';

import { JEST_EXE_TIME } from '@ui/test/constants';
import { Config } from '@ui/test/helpers/Config';
import { TestHelper } from '@ui/test/helpers/TestHelper';
import { CreatePoolPage } from '@ui/test/pages/pools/CreatePoolPage';

dotenv.config();

let browser: DappeteerBrowser;
let page: DappeteerPage;
let metamask: Dappeteer;

let createPoolPage: CreatePoolPage;

const { chainId, networkName, symbol, rpc } = Config.init();
const { name, oracle, closeFactor, liquidationIncentive, testUrl } = Config.createPool();

// jest.retryTimes(1);
jest.setTimeout(JEST_EXE_TIME);

describe('Create Pool:', () => {
  beforeAll(async () => {
    [metamask, page, browser] = await TestHelper.initDappeteer({
      networkName,
      rpc,
      chainId,
      symbol,
    });

    createPoolPage = new CreatePoolPage(page, metamask, testUrl);

    await page.goto(testUrl);
    await page.bringToFront();
    await createPoolPage.acceptTerms();
    await createPoolPage.connectMetamaskWallet();
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can create pool`, async () => {
    await createPoolPage.createPool(name, oracle, closeFactor, liquidationIncentive);
  });
});
