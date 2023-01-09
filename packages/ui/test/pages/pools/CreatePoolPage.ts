import { Dappeteer, DappeteerPage } from '@chainsafe/dappeteer';

import { AppPage } from '@ui/test/pages/AppPage';

export class CreatePoolPage extends AppPage {
  // Page selectors
  private NameInputSelector = '#name';
  private OracleSelectSelector = '#oracle';
  private whitelistSwitchSelector = '#isWhitelisted';
  private CloseFactorInputSelector = '#closeFactor input';
  private LiqIncentInputSelector = '#liqIncent input';
  private CreatePoolBtnSelector = '#createPool';
  private SuccessToast = '#toast-success';

  constructor(page: DappeteerPage, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async createPool(
    name: string,
    oracle: string,
    closeFactor: string,
    liquidationIncentive: string
  ): Promise<void> {
    await this.setPoolName(name);
    await this.setOracle(oracle);
    await this.setCloseFactor(closeFactor);
    await this.setLiquidationIncentive(liquidationIncentive);

    await this.confirmCreate();
  }

  public async setPoolName(name: string): Promise<void> {
    await this.blockingWait(1);
    const NameInput = await this.Page.waitForSelector(this.NameInputSelector);

    if (NameInput) {
      await NameInput.type(name);
    }
  }

  public async setOracle(oracle: string): Promise<void> {
    await this.blockingWait(1);
    await this.Page.$eval(
      this.OracleSelectSelector,
      (el) => ((el as HTMLSelectElement).value = oracle)
    );
  }

  public async setCloseFactor(closeFactor: string): Promise<void> {
    await this.blockingWait(1);
    await this.Page.$eval(this.CloseFactorInputSelector, (el) => (el.textContent = closeFactor));
  }

  public async setLiquidationIncentive(liqIncent: string): Promise<void> {
    await this.blockingWait(1);
    await this.Page.$eval(this.LiqIncentInputSelector, (el) => (el.textContent = liqIncent));
  }

  public async confirmCreate(): Promise<void> {
    await this.blockingWait(1);
    const createPoolBtn = await this.Page.$(this.CreatePoolBtnSelector);
    if (createPoolBtn) {
      await createPoolBtn.click();
      let finished = false;
      while (!finished) {
        try {
          await this.blockingWait(5);
          await Promise.race([
            this.Metamask.confirmTransaction(),
            new Promise((resolve) => setTimeout(resolve, 5000)),
          ]).catch();

          await this.Page.bringToFront();
          const toast = await this.Page.waitForSelector(this.SuccessToast, { timeout: 10000 });
          if (toast) {
            finished = true;
          }
        } catch {}
      }
      const url = this.Page.url();
      expect(url).toContain('http://localhost:3000/56/pool');
    }
  }
}
