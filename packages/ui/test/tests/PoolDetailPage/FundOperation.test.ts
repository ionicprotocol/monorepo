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

const { chainId, networkName, symbol, rpc } = Config.init();
const { supplyAmount, borrowAmount, repayAmount, withdrawAmount, assetSymbol, testUrl } =
  Config.fundOperation();

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
    await poolDetailPage.acceptTerms();
    await poolDetailPage.connectMetamaskWallet();
    await poolDetailPage.openPanel(assetSymbol);
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeEach(async () => {});

  afterAll(async () => {
    browser.close();
  });

  test(`User can supply on pool`, async () => {
    const balanceBefore = await poolDetailPage.supplyBalance(assetSymbol);
    await poolDetailPage.supply(assetSymbol, supplyAmount);
    const balanceAfter = await poolDetailPage.supplyBalance(assetSymbol);
    expect(balanceBefore).not.toEqual(balanceAfter);
  });

  test(`User can borrow on pool`, async () => {
    const balanceBefore = await poolDetailPage.borrowBalance(assetSymbol);
    await poolDetailPage.borrow(assetSymbol, borrowAmount);
    const balanceAfter = await poolDetailPage.borrowBalance(assetSymbol);
    expect(balanceBefore).not.toEqual(balanceAfter);
  });

  test(`User can repay on pool`, async () => {
    const balanceBefore = await poolDetailPage.borrowBalance(assetSymbol);
    await poolDetailPage.repay(assetSymbol, repayAmount);
    const balanceAfter = await poolDetailPage.borrowBalance(assetSymbol);
    expect(balanceBefore).not.toEqual(balanceAfter);
  });

  test(`User can withdraw on pool`, async () => {
    const balanceBefore = await poolDetailPage.supplyBalance(assetSymbol);
    await poolDetailPage.withdraw(assetSymbol, withdrawAmount);
    const balanceAfter = await poolDetailPage.supplyBalance(assetSymbol);
    expect(balanceBefore).not.toEqual(balanceAfter);
  });
});
