import { DotDotPlugin, Rewards, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../alert';
import { AbstractAPYProvider } from './AbstractAPYProvider';
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

class DotDotAPYProvider extends AbstractAPYProvider {
  static apyEndpoint = 'https://api.dotdot.finance/api/lpDetails';
  private dotDotAPYs: DotDotAPYResponse['data']['tokens'] | undefined;

  async init() {
    const response: DotDotAPYResponse = await (await axios.get(DotDotAPYProvider.apyEndpoint)).data;
    this.dotDotAPYs = response.data.tokens;
    if (!this.dotDotAPYs) {
      throw `DotDotAPYProvider: unexpected DotDot APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: DotDotPlugin): Promise<Rewards> {
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

    const rewards = [];
    const [dddAddress, epxAddress] = pluginData.otherParams[4];
    const [dddFlywheel, epxFlywheel] = pluginData.otherParams;
    const { dddAPR, epxAPR } = apyData;

    if (dddAPR === undefined) {
      await functionsAlert(
        'DotDotAPYProvider: Missing APY',
        `DDD APY is missing for \`${pluginAddress}\`, retire plugin?`
      );
    } else {
      rewards.push({ apy: dddAPR, token: dddAddress, flywheel: dddFlywheel });
    }

    if (epxAPR === undefined) {
      await functionsAlert(
        'DotDotAPYProvider: Missing APY',
        `EPX APY is missing for \`${pluginAddress}\`, retire plugin?`
      );
    } else {
      rewards.push({ apy: epxAPR, token: epxAddress, flywheel: epxFlywheel });
    }

    return rewards;
  }
}

export default new DotDotAPYProvider();
