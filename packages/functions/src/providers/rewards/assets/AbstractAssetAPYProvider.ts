import { AbstractPlugin, AssetReward, Reward, SupportedChains } from '@ionicprotocol/types';
import { ethers } from 'ethers';
export interface APYProviderInitObject {
  chainId: SupportedChains;
  provider: ethers.providers.JsonRpcProvider;
}
export abstract class AbstractAssetAPYProvider {
  abstract init({ chainId, provider }: APYProviderInitObject): Promise<void>;
  abstract getApy(assetAddress: string, assetData: unknown): Promise<Reward[]>;
}
