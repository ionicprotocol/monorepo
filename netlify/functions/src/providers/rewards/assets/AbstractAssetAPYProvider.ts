import { Reward, SupportedChains } from '@ionicprotocol/types';
import { PublicClient } from 'viem';
export interface APYProviderInitObject {
  chainId: SupportedChains;
  publicClient: PublicClient;
}
export abstract class AbstractAssetAPYProvider {
  abstract init({ chainId, publicClient }: APYProviderInitObject): Promise<void>;
  abstract getApy(assetAddress: string, assetData: unknown): Promise<Reward[]>;
}
