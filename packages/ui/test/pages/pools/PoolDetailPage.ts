import type { Dappeteer, DappeteerPage } from '@chainsafe/dappeteer';
import { FundOperationMode } from '@ionicprotocol/types';

import { AppPage } from '@ui/test/pages/AppPage';

export class PoolDetailPage extends AppPage {
  private marketColumn = ' .marketName';
  private SupplyAssetBalance = ' .supplyBalance';
  private BorrowAssetBalance = ' .borrowBalance';
  private ModalTokenSymbol = '#fundOperationModal #symbol';
  private FundInput = '#fundInput';
  private ConfirmFundButton = '#confirmFund:not([disabled])';
  private UpdatedToast = '#toast-updated';

  constructor(page: DappeteerPage, metamask: Dappeteer, baseUrl: string) {
    super(page, metamask, baseUrl);
  }

  public async openPanel(symbol: string): Promise<void> {
    await this.blockingWait(3);
    await this.Page.waitForSelector('.' + symbol + this.marketColumn);
    const marketName = await this.Page.$('.' + symbol + this.marketColumn);
    if (marketName) {
      marketName.click();
    }
  }

  public async supplyBalance(symbol: string): Promise<string | undefined> {
    await this.Page.waitForSelector('.' + symbol + this.SupplyAssetBalance);
    return (
      (await this.Page.$eval('.' + symbol + this.SupplyAssetBalance, (el) => el.textContent)) ||
      undefined
    );
  }

  public async borrowBalance(symbol: string): Promise<string | undefined> {
    await this.Page.waitForSelector('.' + symbol + this.BorrowAssetBalance);
    return (
      (await this.Page.$eval('.' + symbol + this.BorrowAssetBalance, (el) => el.textContent)) ||
      undefined
    );
  }

  public async fundOperation(
    mode: FundOperationMode,
    symbol: string,
    amount: string,
    balanceBefore?: string
  ): Promise<void> {
    await this._openModal(mode, symbol);
    await this._setAmount(amount);
    await this._confirm();
    await this._expected(mode, symbol, amount, parseFloat(balanceBefore || ''));
  }

  private async _openModal(mode: FundOperationMode, symbol: string): Promise<void> {
    try {
      const fundOperationBtn = await this.Page.waitForSelector(
        '.' + symbol + '.' + FundOperationMode[mode].toLowerCase() + ':not([disabled])',
        { timeout: 10000 }
      );

      if (fundOperationBtn) {
        await fundOperationBtn.click();
        await this.Page.waitForSelector(this.ModalTokenSymbol);
        const _symbol = await this.Page.$eval(this.ModalTokenSymbol, (el) => el.textContent);
        expect(_symbol).toEqual(symbol);
      }
    } catch {
      throw new Error(`${FundOperationMode[mode]} Button disabled!`);
    }
  }

  private async _setAmount(amount: string): Promise<void> {
    const fundInput = await this.Page.waitForSelector(this.FundInput);
    if (fundInput) {
      await fundInput.type(amount);
    }
  }

  private async _confirm(): Promise<void> {
    const confirmFundButton = await this.Page.waitForSelector(this.ConfirmFundButton);

    if (confirmFundButton) {
      await confirmFundButton.click();

      let finished = false;
      while (!finished) {
        try {
          await this.blockingWait(5);
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
    }
  }

  private async _expected(
    mode: FundOperationMode,
    symbol: string,
    amount: string,
    balanceBefore: number
  ): Promise<void> {
    if (mode === FundOperationMode.SUPPLY) {
      const supplyBalanceAfter = await this.supplyBalance(symbol);
      if (supplyBalanceAfter) {
        expect(parseFloat(supplyBalanceAfter).toFixed(2)).toEqual(
          (balanceBefore + Number(amount)).toFixed(2)
        );
      } else {
        throw new Error(`Supply Error!`);
      }
    } else if (mode === FundOperationMode.BORROW) {
      const borrowBalanceAfter = await this.borrowBalance(symbol);
      if (borrowBalanceAfter) {
        expect(parseFloat(borrowBalanceAfter).toFixed(2)).toEqual(
          (balanceBefore + Number(amount)).toFixed(2)
        );
      } else {
        throw new Error(`Borrow Error!`);
      }
    } else if (mode === FundOperationMode.REPAY) {
      const borrowBalanceAfter = await this.borrowBalance(symbol);
      if (borrowBalanceAfter) {
        expect(parseFloat(borrowBalanceAfter).toFixed(2)).toEqual(
          (balanceBefore - Number(amount)).toFixed(2)
        );
      } else {
        throw new Error(`Repay Error!`);
      }
    } else if (mode === FundOperationMode.WITHDRAW) {
      const supplyBalanceAfter = await this.supplyBalance(symbol);
      if (supplyBalanceAfter) {
        expect(parseFloat(supplyBalanceAfter).toFixed(2)).toEqual(
          (balanceBefore - Number(amount)).toFixed(2)
        );
      } else {
        throw new Error(`Withdraw Error!`);
      }
    }
  }
}
