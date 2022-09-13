import { Dappeteer } from '@chainsafe/dappeteer';
import { Page } from 'puppeteer';

import { AppPage } from '@ui/test/pages/AppPage';

export class PoolDetailPage extends AppPage {
  private SupplyListAssetSymbol = '#supplyList .WMATIC';
  private SupplyAssetBalance = '#supplyTokenBalance';
  private ModalTokenSymbol = '#fundOperationModal #symbol';
  private FundInput = '#fundInput';
  private ConfirmFundButton = '#confirmFund:not([disabled])';

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async supply(amount: string): Promise<void> {
    await this.Page.waitForSelector(this.SupplyAssetBalance);
    const supplyBalance = await this.Page.$eval(this.SupplyAssetBalance, (el) => el.textContent);
    await this.openModal();
    await this.setAmount(amount);

    await this.confirm(parseInt(supplyBalance || ''), amount);
  }

  public async openModal(): Promise<void> {
    const supplyListAssetRow = await this.Page.waitForSelector(this.SupplyListAssetSymbol);
    if (supplyListAssetRow) {
      await supplyListAssetRow.click();
      await this.Page.waitForSelector(this.ModalTokenSymbol);
      const symbol = await this.Page.$eval(this.ModalTokenSymbol, (el) => el.textContent);
      expect(symbol).toEqual('WMATIC');
    }
  }

  public async setAmount(amount: string): Promise<void> {
    const fundInput = await this.Page.waitForSelector(this.FundInput);
    if (fundInput) {
      await fundInput.type(amount);
    }
  }

  public async confirm(balance: number, amount: string): Promise<void> {
    const confirmFundButton = await this.Page.waitForSelector(this.ConfirmFundButton);
    if (confirmFundButton) {
      await confirmFundButton.click();
      await this.blockingWait(3, true);
      await this.Metamask.confirmTransaction();
      await this.bringToFront();
      await this.Page.waitForSelector(this.SupplyAssetBalance);
      const updatedBalance = await this.Page.$eval(this.SupplyAssetBalance, (el) => el.textContent);
      if (updatedBalance) {
        expect(parseInt(updatedBalance)).toEqual(balance + Number(amount));
      } else {
        throw new Error('Supply Error!');
      }
    }
  }
}
