import { HelioHAYPlugin, Reward, Strategy } from '@ionicprotocol/types';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';

import { Contract, utils } from 'ethers';

class HelioAPYProvider extends AbstractPluginAPYProvider {
  private provider: APYProviderInitObject['provider'] | undefined;

  async init(initObj: APYProviderInitObject): Promise<void> {
    this.provider = initObj.provider;
  }

  async getApy(pluginAddress: string, pluginData: HelioHAYPlugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.HelioHAY)
      throw `HelioAPYProvider: Not a Helio Plugin ${pluginAddress}`;

    const jarAddress = pluginData.otherParams[0];

    if (!jarAddress) throw `HelioAPYProvider: No jar address found for ${pluginAddress}`;

    const jarContract = new Contract(jarAddress, JAR_ABI, this.provider);

    const [rate, totalSupply] = await Promise.all([
      jarContract.callStatic.rate(),
      jarContract.callStatic.totalSupply(),
    ]);

    const rateV = parseFloat(utils.formatEther(rate));
    const totalDeposit = parseFloat(utils.formatEther(totalSupply));

    const apy = (rateV * 31536000) / totalDeposit;

    return [{ plugin: pluginAddress, apy, updated_at: new Date().toISOString() }];
  }
}

export default new HelioAPYProvider();

const JAR_ABI = [
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'earned',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'endTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUpdate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'live',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'rewards',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
