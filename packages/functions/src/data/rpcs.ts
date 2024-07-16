import { SupportedChains } from '@ionicprotocol/types';
import { base, bob, mode, optimism } from '@ionicprotocol/chains';

type RpcUrls = Partial<Record<SupportedChains, string>>;

export const rpcUrls: RpcUrls = {
  [SupportedChains.mode]: mode.specificParams.metadata.rpcUrls.default.http[0],
  [SupportedChains.base]: base.specificParams.metadata.rpcUrls.default.http[0],
  [SupportedChains.optimism]: optimism.specificParams.metadata.rpcUrls.default.http[0],
  [SupportedChains.bob]: bob.specificParams.metadata.rpcUrls.default.http[0],
};
