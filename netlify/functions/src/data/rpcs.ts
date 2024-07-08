import { SupportedChains } from '@ionicprotocol/types';

type RpcUrls = Partial<Record<SupportedChains, string>>;

export const rpcUrls: RpcUrls = {
  [SupportedChains.mode]: 'https://mainnet.mode.network',
  [SupportedChains.base]: 'https://mainnet.base.org',
  [SupportedChains.optimism]: 'https://mainnet.optimism.io',
};
