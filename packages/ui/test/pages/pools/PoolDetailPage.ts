import { Dappeteer } from '@chainsafe/dappeteer';
import { FundOperationMode } from '@midas-capital/types';
import { Page } from 'puppeteer';

import { AppPage } from '@ui/test/pages/AppPage';

export class PoolDetailPage extends AppPage {
  private SupplyListAssetSymbol = '#supplyList .';
  private SupplyAssetBalance = '#supplyTokenBalance';
  private ModalTokenSymbol = '#fundOperationModal #symbol';
  private ModalWithdrawTab = '#fundOperationModal .withdrawTab';
  private FundInput = '#fundInput';
  private ConfirmFundButton = '#confirmFund:not([disabled])';
  private SuccessToast = '#toast-success';

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async supply(symbol: string, amount: string): Promise<void> {
    await this.Page.waitForSelector(this.SupplyAssetBalance);
    const supplyBalance = await this.Page.$eval(this.SupplyAssetBalance, (el) => el.textContent);
    await this.openModal(symbol);
    await this.setAmount(amount);
    await this.confirm(parseFloat(supplyBalance || ''), amount, FundOperationMode.SUPPLY);
  }

  public async withdraw(symbol: string, amount: string): Promise<void> {
    await this.Page.waitForSelector(this.SupplyAssetBalance);
    const supplyBalance = await this.Page.$eval(this.SupplyAssetBalance, (el) => el.textContent);
    await this.openModal(symbol);
    const withdrawTab = await this.Page.waitForSelector(this.ModalWithdrawTab);
    if (withdrawTab) {
      await withdrawTab.click();
      await this.setAmount(amount);
      await this.confirm(parseFloat(supplyBalance || ''), amount, FundOperationMode.WITHDRAW);
    } else {
      throw new Error('Withdraw Tab Error!');
    }
  }

  public async openModal(symbol: string): Promise<void> {
    const supplyListAssetRow = await this.Page.waitForSelector(this.SupplyListAssetSymbol + symbol);
    if (supplyListAssetRow) {
      await supplyListAssetRow.click();
      await this.Page.waitForSelector(this.ModalTokenSymbol);
      const _symbol = await this.Page.$eval(this.ModalTokenSymbol, (el) => el.textContent);
      expect(_symbol).toEqual(symbol);
    }
  }

  public async setAmount(amount: string): Promise<void> {
    const fundInput = await this.Page.waitForSelector(this.FundInput);
    if (fundInput) {
      await fundInput.type(amount);
    }
  }

  public async confirm(balance: number, amount: string, mode: FundOperationMode): Promise<void> {
    const confirmFundButton = await this.Page.waitForSelector(this.ConfirmFundButton);
    if (confirmFundButton) {
      await confirmFundButton.click();
      await this.blockingWait(4);
      await this.Metamask.confirmTransaction();
      await this.blockingWait(4);
      await this.bringToFront();
      await this.Page.waitForSelector(this.SuccessToast);
      await this.blockingWait(2);
      if (mode === FundOperationMode.SUPPLY) {
        await this.Page.waitForSelector(this.SupplyAssetBalance);
        const updatedBalance = await this.Page.$eval(
          this.SupplyAssetBalance,
          (el) => el.textContent
        );
        if (updatedBalance) {
          expect(parseFloat(updatedBalance).toString()).toEqual(
            (balance + Number(amount)).toFixed(2)
          );
        } else {
          throw new Error('Supply Error!');
        }
      } else if (mode === FundOperationMode.WITHDRAW) {
        await this.Page.waitForSelector(this.SupplyAssetBalance);
        const updatedBalance = await this.Page.$eval(
          this.SupplyAssetBalance,
          (el) => el.textContent
        );
        if (updatedBalance) {
          expect(parseFloat(updatedBalance).toString()).toEqual(
            (balance - Number(amount)).toFixed(2)
          );
        } else {
          throw new Error('Withdraw Error!');
        }
      }
    }
  }
}
