import { AppPageComponent } from '../AppPageComponent';

export class CurrencySelectComponent extends AppPageComponent {
  // Selectors
  private SelectTokenInputSelector = '#txt-select-token';
  private AllCurrenciesListSelector = '#all-currencies-list';
  private SelectTokenResultsSelector = '.token-';

  public async selectToken(tokenSymbol: string): Promise<void> {
    await this.Page.waitForSelector(this.AllCurrenciesListSelector);
    await this.blockingWait(3);

    const tokenSelector = this.SelectTokenResultsSelector + tokenSymbol;

    const tokenButton = await this.Page.$(tokenSelector);

    if (tokenButton) {
      // @ts-ignore TYPE NEEDS FIXING
      await tokenButton.click();
    }
  }
}
