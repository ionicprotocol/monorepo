import { PluginData, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../alert';
import { ExternalAPYProvider } from './ExternalAPYProvider';

interface BeefyAPYResponse {
  [key: string]: number;
}

class BeefyAPYProvider extends ExternalAPYProvider {
  static apyEndpoint = 'https://api.beefy.finance/apy';
  private beefyAPYs: BeefyAPYResponse | undefined;

  async init() {
    this.beefyAPYs = await (await axios.get(BeefyAPYProvider.apyEndpoint)).data;
    if (!this.beefyAPYs) {
      throw `BeefyAPYProvider: unexpected Beefy APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: PluginData): Promise<number> {
    if (pluginData.strategy != Strategy.Beefy)
      throw `BeefyAPYProvider: Not a Beefy Plugin ${pluginAddress}`;

    if (!pluginData.apyDocsUrl) throw 'BeefyAPYProvider: `apyDocsUrl` is required to map Beefy APY';

    const beefyID = pluginData.apyDocsUrl.split('/').pop();
    if (!beefyID) throw 'BeefyAPYProvider: unable to extract `Beefy ID` from `apyDocsUrl`';

    if (!this.beefyAPYs) {
      throw 'BeefyAPYProvider: Not initialized';
    }

    const apy = this.beefyAPYs![beefyID];
    if (apy === undefined) {
      throw `BeefyAPYProvider: Beefy ID: "${beefyID}" not included in Beefy APY data`;
    }

    if (apy === 0) {
      functionsAlert(`External APY of Plugin is 0`, pluginAddress);
    }

    return apy;
  }
}

export default new BeefyAPYProvider();
