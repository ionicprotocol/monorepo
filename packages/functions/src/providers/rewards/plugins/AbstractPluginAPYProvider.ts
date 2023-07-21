import { AbstractPlugin, Reward, SupportedChains } from '@ionicprotocol/types';
import { ethers } from 'ethers';
export interface APYProviderInitObject {
  chainId: SupportedChains;
  provider: ethers.providers.JsonRpcProvider;
}
export abstract class AbstractPluginAPYProvider {
  abstract init({ chainId, provider }: APYProviderInitObject): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: AbstractPlugin): Promise<Reward[]>;
}
