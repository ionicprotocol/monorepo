import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from '@midas-capital/chains';
import { MidasSdk } from '@midas-capital/sdk';
import { ChainConfig } from '@midas-capital/types';

import { NETWORK_DATA } from '@ui/networkData/index';

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
};

export function providerURLForChain(chainId: number) {
  const network = Object.values(NETWORK_DATA).find((each) => each.chainId === chainId);
  if (!network) {
    throw new Error(`Unable to get providerUrlForChain() for chainId: ${chainId}`);
  }

  return network.rpcUrls.default;
}

export const initFuseWithProviders = (
  provider: JsonRpcProvider | Web3Provider,
  chainId: number
): MidasSdk => {
  const midasSdk = new MidasSdk(provider, chainIdToConfig[chainId]);
  midasSdk.contracts.FusePoolLens = midasSdk.contracts.FusePoolLens.connect(
    new JsonRpcProvider(providerURLForChain(chainId), 'any')
  );

  return midasSdk;
};
