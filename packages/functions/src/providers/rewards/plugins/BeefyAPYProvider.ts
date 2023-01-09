import { BeefyPlugin, Reward, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../../alert';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';
interface BeefyAPYResponse {
  [key: string]: number;
}

interface BeefyVaultResponse {
  [key: string]: string | number | string[];
}

class BeefyAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'https://api.beefy.finance/apy';
  static vaultsEndpoint = 'https://api.beefy.finance/vaults';

  private beefyAPYs: BeefyAPYResponse | undefined;
  private beefyVaults: BeefyVaultResponse[] | undefined;

  async init() {
    this.beefyAPYs = await (await axios.get(BeefyAPYProvider.apyEndpoint)).data;
    if (!this.beefyAPYs) {
      throw `BeefyAPYProvider: unexpected Beefy APY response`;
    }

    this.beefyVaults = await (await axios.get(BeefyAPYProvider.vaultsEndpoint)).data;
    if (!this.beefyVaults) {
      throw `BeefyAPYProvider: unexpected Beefy Vaults response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: BeefyPlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.Beefy)
      throw `BeefyAPYProvider: Not a Beefy Plugin ${pluginAddress}`;

    if (!pluginData.apyDocsUrl) throw 'BeefyAPYProvider: `apyDocsUrl` is required to map Beefy APY';

    const beefyID = pluginData.apyDocsUrl.split('/').pop();
    if (!beefyID) throw 'BeefyAPYProvider: unable to extract `Beefy ID` from `apyDocsUrl`';

    if (!this.beefyAPYs || !this.beefyVaults) {
      throw 'BeefyAPYProvider: Not initialized';
    }

    let apy = this.beefyAPYs![beefyID];
    if (apy === undefined) {
      await functionsAlert(
        `BeefyAPYProvider: ${beefyID}`,
        `Beefy ID: "${beefyID}" not included in Beefy APY data`
      );
      throw `Beefy ID: "${beefyID}" not included in Beefy APY data`;
    }

    const vaultInfo = this.beefyVaults.find((vault) => vault.id === beefyID);
    if (vaultInfo?.status === 'paused') {
      apy = 0;
    }

    if (apy === 0) {
      console.warn(`BeefyAPYProvider: ${pluginAddress}`, 'External APY of Plugin is 0');
      // Disabled as spamming discord, as beefy is not fixing this.
      // await functionsAlert(`BeefyAPYProvider: ${pluginAddress}`, 'External APY of Plugin is 0');
    }

    return [{ apy, updated_at: new Date().toISOString(), plugin: pluginAddress }];
  }
}

export default new BeefyAPYProvider();
