import { DysonPlugin, Reward, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';

import { z } from 'zod';
import { functionsAlert } from '../../../alert';

const DysonAPYResponse = z.record(z.union([z.number(), z.null()]));
type DysonAPYResponse = z.infer<typeof DysonAPYResponse>;

class DysonAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'https://api.dyson.money/apy';

  private dysonAPYs: DysonAPYResponse | undefined;

  async init() {
    this.dysonAPYs = await axios
      .get(DysonAPYProvider.apyEndpoint)
      .then((response) => response.data)
      .then((data) => DysonAPYResponse.parse(data));
  }

  async getApy(pluginAddress: string, pluginData: DysonPlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.Dyson4626)
      throw `DysonAPYProvider: Not a Dyson Plugin ${pluginAddress}`;

    if (!pluginData.apyDocsUrl) throw 'DysonAPYProvider: `apyDocsUrl` is required to map Dyson APY';

    const dysonID = pluginData.apyDocsUrl.split('=').pop();
    if (!dysonID) throw 'DysonAPYProvider: unable to extract `Dyson ID` from `apyDocsUrl`';

    if (!this.dysonAPYs) {
      throw 'DysonAPYProvider: Not initialized';
    }

    let apy = this.dysonAPYs[dysonID];

    if (apy === null || apy === undefined) {
      await functionsAlert(
        `DysonAPYProvider: ${dysonID}`,
        `Dyson APY is 'null | undefined'. Please check the vault: ${pluginData.apyDocsUrl}`
      );

      apy = 0;
    }

    return [{ apy: apy, updated_at: new Date().toISOString(), plugin: pluginAddress }];
  }
}

export default new DysonAPYProvider();
