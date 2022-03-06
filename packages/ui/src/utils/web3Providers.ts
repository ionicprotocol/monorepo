import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Fuse, SupportedChains } from '@midas-capital/sdk';

import { NETWORK_DATA } from '@constants/networkData';

export function providerURLForChain(chainId: number) {
  const network = Object.values(NETWORK_DATA).filter((each) => each.chainId === chainId);
  return network[0].rpcUrls[0];
}

export function chooseBestWeb3Provider(): JsonRpcProvider | Web3Provider {
  if (typeof window === 'undefined') {
    return new JsonRpcProvider(providerURLForChain(SupportedChains.ganache));
  }
  if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    // we are in the browser and metamask is running
    return new Web3Provider(window.ethereum, 'any');
  } else {
    // we are on the server *OR* the user is not running metamask
    // set the bsc as the best provider
    return new JsonRpcProvider(
      providerURLForChain(
        process.env.NODE_ENV === 'development' ? SupportedChains.chapel : SupportedChains.bsc
      )
    );
  }
}

export const initFuseWithProviders = (
  provider = chooseBestWeb3Provider(),
  chainId?: number
): Fuse => {
  let fuse;

  if (chainId) {
    fuse = new Fuse(provider, chainId);
    fuse.contracts.FusePoolLens = fuse.contracts.FusePoolLens.connect(
      new JsonRpcProvider(providerURLForChain(chainId))
    );
  }
  // We fall back to creating a new Fuse Object anyways with the fallback to BSC test or mainnet depending on the environment.
  else {
    const _chainId =
      process.env.NODE_ENV === 'development'
        ? SupportedChains.chapel
        : // TODO change this to `bsc` once deployed, otherwise throws an exception on creation, NOT DEPLOYED
          SupportedChains.chapel;
    fuse = new Fuse(provider, _chainId);
    fuse.contracts.FusePoolLens = fuse.contracts.FusePoolLens.connect(
      new JsonRpcProvider(providerURLForChain(_chainId))
    );
  }

  return fuse;
};
