import { Dappeteer, DappeteerPage } from '@chainsafe/dappeteer';

import { CreatePoolPage } from '@ui/test/pages/pools/CreatePoolPage';
import { PoolDetailPage } from '@ui/test/pages/pools/PoolDetailPage';

export class App {
  public CreatePoolPage: CreatePoolPage;
  public PoolDetailPage: PoolDetailPage;

  constructor(page: DappeteerPage, metamask: Dappeteer, baseUrl: string) {
    this.CreatePoolPage = new CreatePoolPage(page, metamask, baseUrl);
    this.PoolDetailPage = new PoolDetailPage(page, metamask, baseUrl);
  }
}
