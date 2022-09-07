import { Dappeteer } from '@chainsafe/dappeteer';
import { Page } from 'puppeteer';

import { CreatePoolPage } from './pools/CreatePoolPage';

export class App {
  public CreatePoolPage: CreatePoolPage;

  constructor(page: Page, metamask: Dappeteer, baseUrl: string) {
    this.CreatePoolPage = new CreatePoolPage(page, metamask, baseUrl);
  }
}
