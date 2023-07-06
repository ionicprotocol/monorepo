import { Reward } from '@ionicprotocol/types';
import { AbstractAssetAPYProvider } from './AbstractAssetAPYProvider';

class MockAPYProvider extends AbstractAssetAPYProvider {
  constructor(private hardcodedAPY: number) {
    super();
  }

  init() {
    return Promise.resolve();
  }

  async getApy(assetAddress: string): Promise<Reward[]> {
    return [
      {
        updated_at: new Date().toISOString(),
        apy: this.hardcodedAPY,
        asset: assetAddress,
      },
    ];
  }
}

export default MockAPYProvider;
