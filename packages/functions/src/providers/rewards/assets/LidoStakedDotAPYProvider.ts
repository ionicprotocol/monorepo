import { Reward } from '@ionicprotocol/types';
import axios from 'axios';
import { AbstractAssetAPYProvider } from './AbstractAssetAPYProvider';

class LidoStakedDotAPYProvider extends AbstractAssetAPYProvider {
  private data:
    | {
        estimatedAPY: number;
      }
    | undefined = undefined;

  async init() {
    this.data = await (await axios.get('https://polkadot.lido.fi/api/stats/')).data;
    if (!this.data) {
      throw `LidoStakedDotAPYProvider: unexpected response`;
    }
  }

  async getApy(assetAddress: string): Promise<Reward[]> {
    if (!this.data) {
      throw `LidoStakedDotAPYProvider: not initialized properly`;
    }

    const rawAPY = this.data.estimatedAPY;
    if (!rawAPY) {
      throw `LidoStakedDotAPYProvider: expected property \`estimatedAPY\` not available`;
    }

    return [
      {
        updated_at: new Date().toISOString(),
        apy: rawAPY / 100,
        asset: assetAddress,
      },
    ];
  }
}

export default new LidoStakedDotAPYProvider();
