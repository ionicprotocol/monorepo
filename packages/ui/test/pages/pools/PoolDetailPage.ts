import { Dappeteer } from '@chainsafe/dappeteer';
import { FundOperationMode } from '@midas-capital/types';
import { Page } from 'puppeteer';

import { AppPage } from '@ui/test/pages/AppPage';

export class PoolDetailPage extends AppPage {
  private marketColumn = '#marketName';
  private SupplyAssetBalance = '#supplyBalance';
  private ModalTokenSymbol = '#fundOperationModal #symbol';
  private FundInput = '#fundInput';
  private ConfirmFundButton = '#confirmFund:not([disabled])';
  private UpdatedToast = '#toast-updated';

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async supply(symbol: string, amount: string): Promise<void> {
    await this.Page.waitForSelector(this.SupplyAssetBalance + '.' + symbol);
    const supplyBalance = await this.Page.$eval(
      this.SupplyAssetBalance + '.' + symbol,
      (el) => el.textContent
    );
    const marketName = await this.Page.waitForSelector(this.marketColumn + ' .' + symbol);
    if (marketName) {
      await marketName.click();
    }
    await this._openModal(FundOperationMode[FundOperationMode.SUPPLY].toLowerCase(), symbol);
    await this._setAmount(amount);
    await this._confirm(parseFloat(supplyBalance || ''), amount, FundOperationMode.SUPPLY, symbol);
  }

  public async supplyBalance(symbol: string): Promise<string | undefined> {
    await this.Page.waitForSelector(this.SupplyAssetBalance + '.' + symbol);
    return (
      (await this.Page.$eval(this.SupplyAssetBalance + '.' + symbol, (el) => el.textContent)) ||
      undefined
    );
  }

  public async withdraw(symbol: string, amount: string): Promise<void> {
    await this.Page.waitForSelector(this.SupplyAssetBalance + '.' + symbol);
    const supplyBalance = await this.Page.$eval(
      this.SupplyAssetBalance + '.' + symbol,
      (el) => el.textContent
    );
    await this._openModal(FundOperationMode[FundOperationMode.WITHDRAW].toLowerCase(), symbol);
    await this._setAmount(amount);
    await this._confirm(
      parseFloat(supplyBalance || ''),
      amount,
      FundOperationMode.WITHDRAW,
      symbol
    );
  }

  private async _openModal(mode: string, symbol: string): Promise<void> {
    const fundOperationBtn = await this.Page.waitForSelector('.' + symbol + '.' + mode);
    if (fundOperationBtn) {
      await fundOperationBtn.click();
      await this.Page.waitForSelector(this.ModalTokenSymbol);
      const _symbol = await this.Page.$eval(this.ModalTokenSymbol, (el) => el.textContent);
      expect(_symbol).toEqual(symbol);
    }
  }

  private async _setAmount(amount: string): Promise<void> {
    const fundInput = await this.Page.waitForSelector(this.FundInput);
    if (fundInput) {
      await fundInput.type(amount);
    }
  }

  private async _confirm(
    balance: number,
    amount: string,
    mode: FundOperationMode,
    symbol: string
  ): Promise<void> {
    const confirmFundButton = await this.Page.waitForSelector(this.ConfirmFundButton);
    if (confirmFundButton) {
      await confirmFundButton.click();
      let finished = false;
      while (!finished) {
        try {
          await this.blockingWait(3);
          await Promise.race([
            this.Metamask.confirmTransaction(),
            new Promise((resolve) => setTimeout(resolve, 5000)),
          ]).catch();

          await this.Page.bringToFront();
          const toast = await this.Page.waitForSelector(this.UpdatedToast, { timeout: 10000 });
          if (toast) {
            finished = true;
          }
        } catch {}
      }

      if (mode === FundOperationMode.SUPPLY) {
        await this.Page.waitForSelector(this.SupplyAssetBalance + '.' + symbol);
        const updatedBalance = await this.Page.$eval(
          this.SupplyAssetBalance + '.' + symbol,
          (el) => el.textContent
        );
        if (updatedBalance) {
          expect(parseFloat(updatedBalance).toFixed(2)).toEqual(
            (balance + Number(amount)).toFixed(2)
          );
        } else {
          throw new Error('Supply Error!');
        }
      } else if (mode === FundOperationMode.WITHDRAW) {
        await this.Page.waitForSelector(this.SupplyAssetBalance + '.' + symbol);
        const updatedBalance = await this.Page.$eval(
          this.SupplyAssetBalance + '.' + symbol,
          (el) => el.textContent
        );

        if (updatedBalance) {
          expect(parseFloat(updatedBalance).toFixed(2)).toEqual(
            (balance - Number(amount)).toFixed(2)
          );
        } else {
          throw new Error('Withdraw Error!');
        }
      }
    }
  }
}
