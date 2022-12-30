import { PluginWithFlywheelReward, Reward, StellaPlugin, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../../alert';
import { AbstractPluginAPYProvider } from './AbstractPluginAPYProvider';
interface StellaSwapAPYResponse {
  success: boolean;
  result: {
    id: string;
    chain: 'moonbeam';
    tokens: string;
    address: string;
    base: number;
    reward: number;
    rewards: { [symbol: string]: number };
    active: boolean;
  }[];
}

class StellaSwapAPYProvider extends AbstractPluginAPYProvider {
  static apyEndpoint = 'http://api.stellaswap.com/api/v1/coindix';
  private stellaSwapAPYs: StellaSwapAPYResponse['result'] | undefined;

  async init() {
    const response: StellaSwapAPYResponse = await (
      await axios.get(StellaSwapAPYProvider.apyEndpoint)
    ).data;
    this.stellaSwapAPYs = response.result;
    if (!this.stellaSwapAPYs) {
      throw `StellaSwapAPYProvider: unexpected APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: StellaPlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.Stella)
      throw `StellaSwapAPYProvider: Not a Stella Plugin ${pluginAddress}`;

    if (this.stellaSwapAPYs === undefined) {
      throw 'StellaSwapAPYProvider: Not initialized';
    }

    const { underlying } = pluginData;
    const apyData = this.stellaSwapAPYs.find(
      (d) => d.address.toLowerCase() === underlying.toLowerCase()
    );
    if (apyData === undefined) {
      throw `StellaSwapAPYProvider: unable to find APY Data for Plugin  "${pluginAddress}", retire plugin?`;
    }
    console.log({ apyData });

    const rewards: PluginWithFlywheelReward[] = [];

    for (const [symbol, apy] of Object.entries(apyData.rewards)) {
      if (symbol === 'STELLA') {
        rewards.push({
          apy,
          flywheel: '0x601ac0Aa2aFdfC9Bd080A41E7BeF95D0b1aff7f9',
          plugin: pluginAddress,
          token: '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2',
          updated_at: new Date().toISOString(),
        });
      } else if (symbol === 'WGLMR') {
        rewards.push({
          apy,
          flywheel: '0x22F1B04104f994D27B89cDB1d7f98102cA5F30cB',
          plugin: pluginAddress,
          token: '0xAcc15dC74880C9944775448304B263D191c6077F',
          updated_at: new Date().toISOString(),
        });
      } else {
        functionsAlert(
          `StellaSwapAPYProvider: Unknown reward token`,
          `Unsaved reward of ${symbol} for plugin ${pluginAddress}`
        );
      }
    }

    console.log({ rewards });
    return rewards;
  }
}

export default new StellaSwapAPYProvider();
