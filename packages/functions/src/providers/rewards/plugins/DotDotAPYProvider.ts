import { DotDotPlugin, Reward, Strategy } from '@ionicprotocol/types';
import axios from 'axios';
import { functionsAlert } from '../../../alert';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';
interface DotDotAPYResponse {
  success: boolean;
  data: {
    tokens: Array<{
      token: string;
      dddAPR: number;
      epxAPR: number;
      realDddAPR: number;
      realEpxAPR: number;
      boostedDddAPR: number;
      boostedEpxAPR: number;
      minEpxAPR: number;
      minDddAPR: number;
    }>;
  };
}

class DotDotAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'https://api.dotdot.finance/api/lpDetails';
  private dotDotAPYs: DotDotAPYResponse['data']['tokens'] | undefined;

  async init() {
    const response: DotDotAPYResponse = await (await axios.get(DotDotAPYProvider.apyEndpoint)).data;
    this.dotDotAPYs = response.data.tokens;
    if (!this.dotDotAPYs) {
      throw `DotDotAPYProvider: unexpected DotDot APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: DotDotPlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.DotDot)
      throw `DotDotAPYProvider: Not a DotDot Plugin ${pluginAddress}`;

    if (!pluginData.apyDocsUrl)
      throw 'DotDotAPYProvider: `apyDocsUrl` is required to map DotDot APY';

    const DotDotID = pluginData.apyDocsUrl.split('/').pop();
    if (!DotDotID) throw 'DotDotAPYProvider: unable to extract `DotDot ID` from `apyDocsUrl`';

    if (this.dotDotAPYs === undefined) {
      throw 'DotDotAPYProvider: Not initialized';
    }

    const { underlying } = pluginData;
    const apyData = this.dotDotAPYs.find((d) => d.token.toLowerCase() === underlying.toLowerCase());
    if (apyData === undefined) {
      throw `DotDotAPYProvider: unable to find APY Data for Plugin  "${pluginAddress}", retire plugin?`;
    }

    const rewards: Reward[] = [];
    const [dddAddress, epxAddress] = pluginData.otherParams[4];
    const [dddFlywheel, epxFlywheel] = pluginData.otherParams;
    const { dddAPR, epxAPR } = apyData;

    if (dddAPR === undefined) {
      await functionsAlert(
        'DotDotAPYProvider: Missing APY',
        `DDD APY is missing for \`${pluginAddress}\`, retire plugin?`
      );
    } else {
      rewards.push({
        apy: dddAPR / 100,
        token: dddAddress,
        flywheel: dddFlywheel,
        plugin: pluginAddress,
        updated_at: new Date().toISOString(),
      });
    }

    if (epxAPR === undefined) {
      await functionsAlert(
        'DotDotAPYProvider: Missing APY',
        `EPX APY is missing for \`${pluginAddress}\`, retire plugin?`
      );
    } else {
      rewards.push({
        apy: epxAPR / 100,
        token: epxAddress,
        flywheel: epxFlywheel,
        plugin: pluginAddress,
        updated_at: new Date().toISOString(),
      });
    }

    return rewards;
  }
}

export default new DotDotAPYProvider();
