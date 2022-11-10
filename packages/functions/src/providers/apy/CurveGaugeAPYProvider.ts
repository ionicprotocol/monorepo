import {
  CurveGaugePlugin,
  PluginWithFlywheelReward,
  Reward,
  Strategy,
  SupportedChains,
} from '@midas-capital/types';
import axios from 'axios';
import { functionsAlert } from '../../alert';
import { AbstractAPYProvider, APYProviderInitObject } from './AbstractAPYProvider';

interface CurveAPYs {
  [lpTokenAddress: string]: PoolDetails;
}
interface GaugeRewards {
  [lpTokenAddress: string]: ExtraReward[];
}

type PoolDetails = {
  poolAddress: string; // name is misleading, it's the LP token address
  apy: number;
  apyWeekly: number;
};

type ExtraReward = {
  tokenAddress: string;
  apy: number; // Already scaled to percentage
};

type Gauge = {
  gauge: string;
  swap_token: string;
  swap: string;
  extraRewards: ExtraReward[];
};

interface CurveAPYResponse {
  data: {
    poolDetails: PoolDetails[];
  };
}

interface CurveGaugeResponse {
  data: {
    gauges: Gauge[];
  };
}

class CurveAPYProvider extends AbstractAPYProvider {
  static apyEndpoints: Partial<Record<SupportedChains, string>> = {
    [SupportedChains.moonbeam]: 'https://api.curve.fi/api/getFactoryAPYs-moonbeam',
    [SupportedChains.polygon]: 'https://api.curve.fi/api/getFactoryAPYs-polygon',
  };
  static gaugeEndpoints: Partial<Record<SupportedChains, string>> = {
    [SupportedChains.moonbeam]: 'https://api.curve.fi/api/getFactoGauges/moonbeam',
    [SupportedChains.polygon]: 'https://api.curve.fi/api/getFactoGauges/polygon',
  };

  private curveAPYs: CurveAPYs | undefined;
  private gaugeRewards: GaugeRewards | undefined;

  async init({ chainId }: APYProviderInitObject) {
    const apyEndpoint = CurveAPYProvider.apyEndpoints[chainId];
    if (!apyEndpoint) {
      throw `CurveAPYProvider: Can not be initialized, no APY endpoint available for chain id ${chainId}`;
    }
    const gaugeEndpoint = CurveAPYProvider.gaugeEndpoints[chainId];
    if (!gaugeEndpoint) {
      throw `CurveAPYProvider: Can not be initialized, no Gauge endpoint available for chain id ${chainId}`;
    }

    const [apyData, gaugeData]: [CurveAPYResponse, CurveGaugeResponse] = await Promise.all([
      axios.get(apyEndpoint).then((response) => response.data),
      axios.get(gaugeEndpoint).then((response) => response.data),
    ]);

    this.curveAPYs = apyData.data.poolDetails.reduce((acc, cur) => {
      return { ...acc, [cur.poolAddress.toLowerCase()]: cur };
    }, {});

    this.gaugeRewards = gaugeData.data.gauges.reduce((acc, cur) => {
      return { ...acc, [cur.swap.toLowerCase()]: cur.extraRewards };
    }, {});
  }

  async getApy(pluginAddress: string, pluginData: CurveGaugePlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.CurveGauge && pluginData.strategy != Strategy.Arrakis)
      throw `CurveAPYProvider: Not a Curve Plugin ${pluginAddress}`;

    if (this.curveAPYs === undefined) {
      throw 'CurveAPYProvider: Not initialized `curveAPYs`';
    }

    const [_, curveLPTokens] = pluginData.otherParams;
    const [lpToken] = curveLPTokens;
    if (!lpToken)
      throw 'CurveAPYProvider: expects second `otherParams[1]` to be Curve Vault LP Token';

    const rewards: Reward[] = [];

    // Get lp Rewards
    const apy = this.curveAPYs[lpToken.toLowerCase()].apy;

    if (apy === undefined) {
      await functionsAlert(
        `CurveAPYProvider: ${lpToken}`,
        `Curve Vault: "${lpToken}" not included in Curve APY data`
      );
      throw `Curve Vault: "${lpToken}" not included in Curve APY data`;
    }

    if (apy === 0) {
      await functionsAlert(`CurveAPYProvider: ${pluginAddress}`, 'External APY of Plugin is 0');
    }
    rewards.push({
      apy: apy / 100,
      plugin: pluginAddress,
      updated_at: new Date().toISOString(),
    });

    // Check for additional Rewards
    if (this.gaugeRewards) {
      console.log(this.gaugeRewards);
      const extraRewards = this.gaugeRewards[lpToken.toLowerCase()];

      if (extraRewards) {
        rewards.push(
          ...extraRewards.map(
            (extraReward) =>
              ({
                apy: extraReward.apy / 100,
                plugin: pluginAddress,
                updated_at: new Date().toISOString(),
                token: extraReward.tokenAddress,
                flywheel: '0xTODO_FLYWHEEL_MOCK', // TODO get flywheel, maybe not necessary.
              } as PluginWithFlywheelReward)
          )
        );
      }
    } else {
      console.warn('CurveAPYProvider: `gaugeRewards` not available');
    }

    return rewards;
  }
}

export default new CurveAPYProvider();
