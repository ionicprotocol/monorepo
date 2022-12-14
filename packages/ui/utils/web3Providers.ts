import { chainIdToConfig } from '@ui/types/ChainMetaData';

export function providerURLForChain(chainId: number) {
  const network = chainIdToConfig[chainId].specificParams.metadata;
  if (!network) {
    throw new Error(`Unable to get providerUrlForChain() for chainId: ${chainId}`);
  }

  return network.rpcUrls.default.http[0];
}
