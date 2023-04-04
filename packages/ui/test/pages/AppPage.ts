import type { Dappeteer, DappeteerPage } from '@chainsafe/dappeteer';

export abstract class AppPage {
  public Metamask: Dappeteer;

  protected BaseUrl: string;
  protected Page: DappeteerPage;
  protected Route = '';

  protected WalletConnectSelector = '#MetaMask';
  protected ConnectWalletBtn = '#connectWalletBtn';
  protected WalletOptionMetamaskSelector = '#wallet-option-MetaMask';

  private ci: string = process.env.CI || 'false';

  constructor(page: DappeteerPage, metamask: Dappeteer, baseUrl = '') {
    this.Page = page;
    this.BaseUrl = baseUrl;
    this.Metamask = metamask;
  }

  public async navigateTo(): Promise<DappeteerPage> {
    await this.bringToFront();

    if (this.BaseUrl && this.Route) {
      await this.Page.goto(this.BaseUrl + this.Route);
    } else {
      console.warn('Page has no URL and cannot be navigated to');
    }

    return this.Page;
  }

  public async bringToFront(): Promise<DappeteerPage> {
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
    const web3Connected = await this.Page.$('#walletBtn');

    if (web3Connected) return;

    const btnConnectWallet = await this.Page.$(this.ConnectWalletBtn);

    if (btnConnectWallet) {
      await this.blockingWait(1);
      await btnConnectWallet.click();

      const metamaskBtn = await this.Page.waitForSelector(this.WalletConnectSelector);

      if (metamaskBtn) {
        await metamaskBtn.click();
        await this.Metamask.approve();
        await this.bringToFront();
      }
    }
  }

  public async acceptTerms(): Promise<void> {
    const termsAcceptBtn = await this.Page.waitForSelector('#termsAcceptBtn');

    if (termsAcceptBtn) {
      await termsAcceptBtn.click();
    }
  }

  public async addTokenToMetamask(tokenAddress: string): Promise<void> {
    // await this.blockingWait(1);
    await this.Metamask.page.bringToFront();
    await this.closeMetamaskWhatsNew();

    const addTokenButton = await this.Metamask.page.waitForSelector('.import-token-link__link');
    if (addTokenButton) {
      await addTokenButton.click();

      const addressInput = await this.Metamask.page.waitForSelector('#custom-address');
      if (addressInput) {
        // await this.Metamask.page.evaluate(
        //   (input, tokenAddress) => (input.value = tokenAddress),
        //   addressInput,
        //   tokenAddress
        // );

        await addressInput.type(tokenAddress);
        await this.blockingWait(3);

        await this.Metamask.page.waitForSelector(
          `button[data-testid='page-container-footer-next']:not([disabled])`
        );
        const nextButton = await this.Metamask.page.waitForSelector(
          `button[data-testid='page-container-footer-next']`
        );
        if (nextButton) {
          await nextButton.click();
          await this.Metamask.page.waitForSelector('footer > button');
          const buttons = await this.Metamask.page.$$('footer > button');
          await buttons[1].click();

          await this.Metamask.page.reload();
        }
      }
    }
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

  protected async isSwitchChecked(switchId: string): Promise<boolean> {
    let checked = false;

    const checkedValue = await this.Page.$eval(switchId, (button) =>
      button.getAttribute('aria-checked')
    );

    checked = checkedValue === 'true';

    return checked;
  }
}
