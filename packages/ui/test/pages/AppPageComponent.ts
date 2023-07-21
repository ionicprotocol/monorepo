import type { Page } from 'puppeteer';

export abstract class AppPageComponent {
  protected Page: Page;

  private ci: string = process.env.CI || 'false';

  constructor(page: Page) {
    this.Page = page;
  }

  public async blockingWait(seconds: number, checkCi = false): Promise<void> {
    let waitSeconds = seconds;

    if (checkCi && this.ci === 'true') {
      waitSeconds = seconds * 2;
    }

    const waitTill = new Date(new Date().getTime() + waitSeconds * 1000);
    while (waitTill > new Date()) {}
  }
}
