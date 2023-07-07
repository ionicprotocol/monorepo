import { SupportedChains } from '@ionicprotocol/types';

type RpcUrls = Partial<Record<SupportedChains, string>>;

export const rpcUrls: RpcUrls = {
  [SupportedChains.bsc]: 'https://bsc-dataseed1.binance.org/',
  [SupportedChains.moonbeam]: 'https://moonbeam.api.onfinality.io/public',
  [SupportedChains.polygon]: 'https://poly-rpc.gateway.pokt.network',
};
