import { Dappeteer } from '@chainsafe/dappeteer';
import { ElementHandle, Page } from 'puppeteer';

export abstract class AppPage {
  public Metamask: Dappeteer;

  protected BaseUrl: string;
  protected Page: Page;
  protected Route = '';

  protected WalletConnectSelector = '#MetaMask';
  protected WalletOptionMetamaskSelector = '#wallet-option-MetaMask';

  private ci: string = process.env.CI || 'false';

  constructor(page: Page, metamask: Dappeteer, baseUrl = '') {
    this.Page = page;
    this.BaseUrl = baseUrl;
    this.Metamask = metamask;
  }

  public async navigateTo(): Promise<Page> {
    await this.bringToFront();

    if (this.BaseUrl && this.Route) {
      await this.Page.goto(this.BaseUrl + this.Route);
    } else {
      console.warn('Page has no URL and cannot be navigated to');
    }

    return this.Page;
  }

  public async bringToFront(): Promise<Page> {
    await this.Page.bringToFront();
    return this.Page;
  }

  public async evaluateAndClick(btnSelector: string): Promise<void> {
    await this.Page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLElement;

      return element.click();
    }, btnSelector);
  }

  public async connectMetamaskWallet(): Promise<void> {
    await this.blockingWait(1, true);

    const web3Connected = await this.Page.$('#walletBtn');

    if (web3Connected) return;

    const btnConnectWallet = await this.Page.waitForSelector(this.WalletConnectSelector);

    if (btnConnectWallet) {
      await btnConnectWallet.click();
      await this.Metamask.approve();
    }
  }

  public async acceptTerms(): Promise<void> {
    const termsAcceptBtn = await this.Page.waitForSelector('#termsAcceptBtn');

    if (termsAcceptBtn) {
      await termsAcceptBtn.click();
    }
  }

  public async addTokenToMetamask(tokenAddress: string): Promise<void> {
    await this.blockingWait(2);
    await this.Metamask.page.bringToFront();
    await this.closeMetamaskWhatsNew();

    const addTokenButton = await this.Metamask.page.waitForSelector('.import-token-link__link');
    if (addTokenButton) {
      await addTokenButton.click();

      const addressInput = await this.Metamask.page.waitForSelector('#custom-address');
      if (addressInput) {
        addressInput.type(tokenAddress);

        await this.Metamask.page.waitForTimeout(4000);

        await this.Metamask.page.waitForSelector(
          `button[data-testid='page-container-footer-next']:not([disabled])`
        );
        const nextButton = await this.Metamask.page.waitForSelector(
          `button[data-testid='page-container-footer-next']`
        );
        if (nextButton) {
          await nextButton.click();

          const buttons = await this.Metamask.page.$$('footer > button');
          await buttons[1].click();

          await this.Metamask.page.reload();
        }
      }
    }
  }

  public async getMetamaskTokenBalance(tokenSymbol: string): Promise<number> {
    await this.Metamask.page.bringToFront();
    await this.blockingWait(1, true);

    await this.closeMetamaskWhatsNew();

    const assetMenutButton = await this.Metamask.page.waitForSelector(
      `li[data-testid="home__asset-tab"]`
    );
    if (assetMenutButton) {
      await assetMenutButton.click();
      await this.blockingWait(1, true);

      const assetListItems = await this.Metamask.page.$$('.asset-list-item__token-button');

      for (let index = 0; index < assetListItems.length; index++) {
        const assetListItem = assetListItems[index];

        const titleAttributeValue = await this.Metamask.page.evaluate(
          (item) => item.getAttribute('title'),
          assetListItem
        );

        if (
          titleAttributeValue &&
          titleAttributeValue.split(' ')[1].toUpperCase() === tokenSymbol.toUpperCase()
        ) {
          const balance = titleAttributeValue.split(' ')[0];
          this.Page.bringToFront();
          return parseFloat(balance);
        }
      }
    }

    return 0;
  }

  public async closeMetamaskWhatsNew(): Promise<void> {
    await this.blockingWait(1, true);
    const closeWhatsNewButton = await this.Metamask.page.$(
      '#popover-content > div > div > section > header > div > button'
    );
    if (closeWhatsNewButton) {
      await closeWhatsNewButton.click();
    }
  }

  public async confirmMetamaskTransaction(): Promise<void> {
    await this.blockingWait(4);

    try {
      await this.Metamask.confirmTransaction();

      // Try to confirm transaction again
      await this.Metamask.confirmTransaction();
      await this.blockingWait(3);

      const mmFooterButtons = await this.Metamask.page.$$('footer > button');
      if (mmFooterButtons && mmFooterButtons[1]) {
        const confirmButton = mmFooterButtons[1];
        await confirmButton.click();
      }
    } catch (error) {}

    await this.blockingWait(1);
    await this.Page.bringToFront();
    await this.blockingWait(1, true);
  }

  public async blockingWait(seconds: number, checkCi = false): Promise<void> {
    let waitSeconds = seconds;

    if (checkCi && this.ci === 'true') {
      waitSeconds = seconds * 2;
    }

    const waitTill = new Date(new Date().getTime() + waitSeconds * 1000);
    while (waitTill > new Date()) {}
  }

  protected async getSwitchElement(switchId: string): Promise<ElementHandle<Element>> {
    await this.Page.waitForSelector(switchId);
    const switchElement = await this.Page.$(switchId);

    if (switchElement) {
      const buttonElement = (await switchElement.$x('..'))[0] as ElementHandle<Element>;
      if (!buttonElement) {
        throw new Error(
          `Switch with id ${switchId} not found on the page. Check selector is valid.`
        );
      }

      return buttonElement;
    } else {
      throw new Error(`Switch with id ${switchId} not found on the page. Check selector is valid.`);
    }
  }

  protected async isSwitchChecked(switchId: string): Promise<boolean> {
    let checked = false;

    const checkedValue = await this.Page.$eval(switchId, (button) =>
      button.getAttribute('aria-checked')
    );

    checked = checkedValue === 'true';

    return checked;
  }
}
