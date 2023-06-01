import { Reward } from '@midas-capital/types';
import axios from 'axios';
import { AbstractAssetAPYProvider } from './AbstractAssetAPYProvider';

class UniverseStaderlabsAPYProvider extends AbstractAssetAPYProvider {
  private data:
    | {
        value: number;
      }
    | undefined = undefined;

  async init() {
    this.data = await (await axios.get('https://universe.staderlabs.com/polygon/apy')).data;

    if (!this.data) {
      throw `UniverseStaderlabsAPYProvider: unexpected response`;
    }
  }

  async getApy(assetAddress: string): Promise<Reward[]> {
    if (!this.data) {
      throw `UniverseStaderlabsAPYProvider: not initialized properly`;
    }

    const rawAPY = this.data.value;

    if (!rawAPY) {
      throw `UniverseStaderlabsAPYProvider: expected property \`value\` not available`;
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

export default new UniverseStaderlabsAPYProvider();
