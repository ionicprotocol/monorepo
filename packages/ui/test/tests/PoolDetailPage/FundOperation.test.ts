import { Dappeteer } from '@chainsafe/dappeteer';
import { Browser, Page } from 'puppeteer';

import { Config } from '@ui/test//helpers/Config';
import { JEST_EXE_TIME } from '@ui/test/constants';
import { TestHelper } from '@ui/test/helpers/TestHelper';
import { PoolDetailPage } from '@ui/test/pages/pools/PoolDetailPage';

let browser: Browser;
let page: Page;
let metamask: Dappeteer;
let poolDetailPage: PoolDetailPage;

const { chainId, networkName, symbol, rpc, testUrl } = Config.init();
const { supplyAmount, assetSymbol } = Config.fundOperation();

jest.setTimeout(JEST_EXE_TIME);

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
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can supply on pool`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);

    const balanceBefore = await poolDetailPage.supplyBalance();
    await poolDetailPage.supply(assetSymbol, supplyAmount);
    const balanceAfter = await poolDetailPage.supplyBalance();
    expect(balanceBefore).not.toEqual(balanceAfter);
  });

  test(`User can withdraw on pool`, async () => {
    await page.bringToFront();
    await page.goto(testUrl);

    const balanceBefore = await poolDetailPage.supplyBalance();
    await poolDetailPage.withdraw(assetSymbol, supplyAmount);
    const balanceAfter = await poolDetailPage.supplyBalance();
    expect(balanceBefore).not.toEqual(balanceAfter);
  });
});
