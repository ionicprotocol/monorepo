import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';

import { chainIdToConfig } from '@ui/types/ChainMetaData';

export function providerURLForChain(chainId: number) {
  const network = chainIdToConfig[chainId].specificParams.metadata;
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
