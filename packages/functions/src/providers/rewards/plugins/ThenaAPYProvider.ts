import { Reward, Strategy, ThenaERC4626Plugin } from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../../alert';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';
import { z } from 'zod';

const ThenaAPYData = z.object({
  address: z.string(),
  gauge: z.object({
    projectedApr: z.number(),
  }),
});
const ThenaAPYResponse = z.array(ThenaAPYData);
type ThenaAPYResponse = z.infer<typeof ThenaAPYResponse>;

interface ThenaAPYs {
  [key: string]: number;
}

class ThenaAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'https://api.thena.fi/api/v1/pools';
  private thenaAPYs: ThenaAPYs | undefined;

  async init() {
    const thenaResponse = await axios
      .get(ThenaAPYProvider.apyEndpoint)
      .then((response) => response.data)
      .then((data) => ThenaAPYResponse.parse(data.data));

    this.thenaAPYs = thenaResponse.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.address.toLowerCase()]: cur.gauge.projectedApr,
      };
    }, {});

    if (!this.thenaAPYs) {
      throw `ThenaAPYProvider: unable to format Thena APY data as expected`;
    }
  }

  async getApy(pluginAddress: string, pluginData: ThenaERC4626Plugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.ThenaERC4626)
      throw `ThenaAPYProvider: Not a Thena Plugin ${pluginAddress}`;

    if (this.thenaAPYs === undefined) {
      throw 'ThenaAPYProvider: Not initialized';
    }

    const apy = this.thenaAPYs[pluginData.underlying.toLowerCase()];

    if (apy === undefined) {
      await functionsAlert(
        `ThenaAPYProvider: ${pluginData.underlying}`,
        `Unable to find APY data for underlying ${pluginData.underlying}`
      );
      throw `Thena underlying: "${pluginData.underlying}" not included in Thena APY data`;
    }

    if (apy === 0) {
      await functionsAlert(`ThenaAPYProvider: ${pluginAddress}`, 'APY of Plugin is 0');
    }

    return [
      {
        apy: apy / 100,
        plugin: pluginAddress,
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export default new ThenaAPYProvider();
