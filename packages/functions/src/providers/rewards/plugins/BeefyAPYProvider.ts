import { BeefyPlugin, Reward, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';

import { z } from 'zod';
import { functionsAlert } from '../../../alert';

const BeefyAPYResponse = z.record(z.union([z.number(), z.null(), z.string()]));
type BeefyAPYResponse = z.infer<typeof BeefyAPYResponse>;

const BeefyVault = z.object({
  id: z.string(),
  status: z.enum(['active', 'eol', 'paused'] as const),
});
const BeefyVaultResponse = z.array(BeefyVault);
type BeefyVaultResponse = z.infer<typeof BeefyVaultResponse>;

class BeefyAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'https://api.beefy.finance/apy';
  static vaultsEndpoint = 'https://api.beefy.finance/vaults';

  private beefyAPYs: BeefyAPYResponse | undefined;
  private beefyVaults: BeefyVaultResponse | undefined;

  async init() {
    [this.beefyAPYs, this.beefyVaults] = await Promise.all([
      axios
        .get(BeefyAPYProvider.apyEndpoint)
        .then((response) => response.data)
        .then((data) => BeefyAPYResponse.parse(data)),

      axios
        .get(BeefyAPYProvider.vaultsEndpoint)
        .then((response) => response.data)
        .then((data) => BeefyVaultResponse.parse(data)),
    ]);
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

    let apy = this.beefyAPYs[beefyID];
    const { status } = this.beefyVaults.find((vault) => vault.id === beefyID) || {};

    if (status != 'active') {
      console.log([
        { apy: 0, status, updated_at: new Date().toISOString(), plugin: pluginAddress },
      ]);
      if (status == 'eol') {
        await functionsAlert(
          `BeefyAPYProvider: ${beefyID}`,
          `Beefy Vault reach EOL status. Please check the vault: ${pluginData.apyDocsUrl}`
        );
      }
      return [{ apy: 0, status, updated_at: new Date().toISOString(), plugin: pluginAddress }];
    } else {
      if (apy === null || apy === undefined) {
        await functionsAlert(
          `BeefyAPYProvider: ${beefyID}`,
          `Beefy Vault APY is 'null | undefined' but Vault is 'active'. Please check the vault: ${pluginData.apyDocsUrl}`
        );
        apy = 0;
      }

      if (typeof apy === 'string') {
        apy = parseFloat(apy);
      }
      return [{ apy: apy, status, updated_at: new Date().toISOString(), plugin: pluginAddress }];
    }
  }
}

export default new BeefyAPYProvider();
