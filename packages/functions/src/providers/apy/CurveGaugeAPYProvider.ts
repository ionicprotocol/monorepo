import {
  CurveGaugePlugin,
  MimoPlugin,
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
type PoolDetails = {
  poolAddress: string; // name is misleading, it's the LP token address
  apy: number;
  apyWeekly: number;
};

interface CurveAPYResponse {
  data: {
    poolDetails: PoolDetails[];
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

  async init({ chainId }: APYProviderInitObject) {
    const apyEndpoint = CurveAPYProvider.apyEndpoints[chainId];
    if (!apyEndpoint) {
      throw `CurveAPYProvider: Can not be initialized, no APY endpoint available for chain id ${chainId}`;
    }

    const response = await axios.get(apyEndpoint);
    const responseData: CurveAPYResponse = await response.data;

    this.curveAPYs = responseData.data.poolDetails.reduce((acc, cur) => {
      return { ...acc, [cur.poolAddress.toLowerCase()]: cur };
    }, {});

    if (!this.curveAPYs) {
      throw `CurveAPYProvider: unexpected Curve APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: CurveGaugePlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.CurveGauge && pluginData.strategy != Strategy.Arrakis)
      throw `CurveAPYProvider: Not a Curve Plugin ${pluginAddress}`;

    if (this.curveAPYs === undefined) {
      throw 'CurveAPYProvider: Not initialized';
    }

    const [_, curveLPTokens] = pluginData.otherParams;
    const [lpToken] = curveLPTokens;
    if (!lpToken)
      throw 'CurveAPYProvider: expects second `otherParams[1]` to be Curve Vault LP Token';

    console.log({ response: this.curveAPYs, lpToken });

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

    console.log({ apy });

    return [
      {
        apy: apy / 100,
        plugin: pluginAddress,
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export default new CurveAPYProvider();
