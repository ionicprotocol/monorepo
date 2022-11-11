import { AbstractPlugin, Reward, SupportedChains } from '@midas-capital/types';
import { ethers } from 'ethers';
export interface APYProviderInitObject {
  chainId: SupportedChains;
  provider: ethers.providers.JsonRpcProvider;
}
export abstract class AbstractAPYProvider {
  abstract init({ chainId, provider }: APYProviderInitObject): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: AbstractPlugin): Promise<Reward[]>;
}
