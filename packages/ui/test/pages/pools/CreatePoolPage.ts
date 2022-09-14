import { Dappeteer } from '@chainsafe/dappeteer';
import { Page } from 'puppeteer';

import { AppPage } from '@ui/test/pages/AppPage';

export class CreatePoolPage extends AppPage {
  // Page selectors
  private NameInputSelector = '#name';
  private OracleSelectSelector = '#oracle';
  private whitelistSwitchSelector = '#isWhitelisted';
  private CloseFactorInputSelector = '#closeFactor input';
  private LiqIncentInputSelector = '#liqIncent input';
  private CreatePoolBtnSelector = '#createPool';

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
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
    const NameInput = await this.Page.waitForSelector(this.NameInputSelector);

    if (NameInput) {
      await NameInput.type(name);
    }
  }

  public async setOracle(oracle: string): Promise<void> {
    await this.Page.select(this.OracleSelectSelector, oracle);
  }

  public async setCloseFactor(closeFactor: string): Promise<void> {
    await this.Page.$eval(this.CloseFactorInputSelector, (el) => (el.textContent = closeFactor));
  }

  public async setLiquidationIncentive(liqIncent: string): Promise<void> {
    await this.Page.$eval(this.LiqIncentInputSelector, (el) => (el.textContent = liqIncent));
  }

  public async confirmCreate(): Promise<void> {
    const createPoolBtn = await this.Page.$(this.CreatePoolBtnSelector);
    if (createPoolBtn) {
      await createPoolBtn.click();
      await this.blockingWait(3, true);
      await this.Metamask.confirmTransaction();
      // await this.bringToFront();
    }
  }
}
