import { MimoPlugin, Rewards, Strategy } from '@midas-capital/types';
import axios from 'axios';
import { BigNumber, utils } from 'ethers';
import { functionsAlert } from '../../alert';
import { AbstractAPYProvider } from './AbstractAPYProvider';
interface MimoAPYResponse
  extends Array<{
    network: number;
    payees: Array<{
      minerAddress: string;
      apy: { type: 'BigNumber'; hex: string };
    }>;
  }> {}

interface MimoAPYs {
  [key: string]: number;
}

class MimoAPYProvider extends AbstractAPYProvider {
  static apyEndpoint = 'https://app.mimo.capital/.netlify/functions/demand-miner-payees';
  private mimoAPYs: MimoAPYs | undefined;

  async init() {
    const mimoResponse = await axios.get(MimoAPYProvider.apyEndpoint);
    const mimoData: MimoAPYResponse = await mimoResponse.data;

    this.mimoAPYs = mimoData
      .flatMap((element) => element.payees)
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.minerAddress.toLowerCase()]: Number(
            utils.formatUnits(BigNumber.from(cur.apy.hex), 18)
          ),
        };
      }, {});
    if (!this.mimoAPYs) {
      throw `MimoAPYProvider: unexpected Mimo APY response`;
    }
  }

  async getApy(pluginAddress: string, pluginData: MimoPlugin): Promise<Rewards> {
    if (pluginData.strategy != Strategy.Mimo && pluginData.strategy != Strategy.Arrakis)
      // TODO should only be using Mimo
      throw `MimoAPYProvider: Not a Mimo Plugin ${pluginAddress}`;

    const [flywheel, vaultAddress, _, rewardTokens] = pluginData.otherParams;

    if (!vaultAddress)
      throw 'MimoAPYProvider: expects second `otherParams[1]` to be Mimo Vault Address';

    if (this.mimoAPYs === undefined) {
      throw 'MimoAPYProvider: Not initialized';
    }

    const apy = this.mimoAPYs[vaultAddress.toLowerCase()];
    // const apy = this.mimoAPYs![beefyID];
    if (apy === undefined) {
      await functionsAlert(
        `MimoAPYProvider: ${vaultAddress}`,
        `Mimo Vault: "${vaultAddress}" not included in Mimo APY data`
      );
      throw `Mimo Vault: "${vaultAddress}" not included in Mimo APY data`;
    }

    if (apy === 0) {
      await functionsAlert(`MimoAPYProvider: ${pluginAddress}`, 'External APY of Plugin is 0');
    }

    return [{ apy, flywheel, token: rewardTokens[0], updated_at: new Date().toISOString() }];
  }
}

export default new MimoAPYProvider();
