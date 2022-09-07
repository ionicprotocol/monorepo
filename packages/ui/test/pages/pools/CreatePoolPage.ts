import { Dappeteer } from '@chainsafe/dappeteer';
import { Page } from 'puppeteer';

import { AppPage } from '../AppPage';

export class CreatePoolPage extends AppPage {
  // Page selectors
  private NameInputSelector = '#name';
  private OracleSelectSelector = '#oracle';
  private whitelistSwitchSelector = '#isWhitelisted';
  private CloseFactorInputSelector = '#field-:rif:';
  private LiqdIncentInputSelector = '#field-:rij:';
  private CreatePoolBtnSelector = '.chakra-button';

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async createPool(
    name: string,
    oracle: string,
    closeFactor: string,
    liquidIcent: string
  ): Promise<void> {
    await this.setPoolName(name);
    await this.setOracle(oracle);
    await this.setCloseFactor(closeFactor);
    await this.setLiquidIncent(liquidIcent);

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
    const closeFactorInput = await this.Page.waitForSelector(this.CloseFactorInputSelector);

    if (closeFactorInput) {
      closeFactorInput.type(closeFactor);
    }
  }

  public async setLiquidIncent(liquidIcent: string): Promise<void> {
    const liqdIncentInput = await this.Page.waitForSelector(this.LiqdIncentInputSelector);

    if (liqdIncentInput) {
      liqdIncentInput.type(liquidIcent);
    }
  }

  public async confirmCreate(): Promise<void> {
    await this.blockingWait(3, true);
    const createPoolBtn = await this.Page.$(this.CreatePoolBtnSelector);
    if (createPoolBtn) {
      await createPoolBtn.click();
      await this.Metamask.confirmTransaction();
      await this.bringToFront();
      await this.blockingWait(3, true);
    }
  }
}
