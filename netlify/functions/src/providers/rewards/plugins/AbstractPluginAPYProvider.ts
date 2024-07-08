import { AbstractPlugin, Reward, SupportedChains } from '@ionicprotocol/types';
import { PublicClient } from 'viem';
export interface APYProviderInitObject {
  chainId: SupportedChains;
  publicClient: PublicClient;
}
export abstract class AbstractPluginAPYProvider {
  abstract init({ chainId, publicClient }: APYProviderInitObject): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: AbstractPlugin): Promise<Reward[]>;
}
