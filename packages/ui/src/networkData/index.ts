import { SupportedChains } from 'sdk';

import BSC from '@ui/networkData/networks/BSC';
import Evmos from '@ui/networkData/networks/Evmos';
import Ganache from '@ui/networkData/networks/Ganache';
import Moonbeam from '@ui/networkData/networks/Moonbeam';
import { ChainMetadata } from '@ui/types/ChainMetaData';

export const NETWORK_DATA: Record<string, ChainMetadata> = {
  [SupportedChains.ganache]: Ganache.testnet,
  [SupportedChains.bsc]: BSC.mainnet,
  [SupportedChains.chapel]: BSC.testnet,
  [SupportedChains.evmos_testnet]: Evmos.testnet,
  [SupportedChains.moonbeam]: Moonbeam.mainnet,
  [SupportedChains.moonbase_alpha]: Moonbeam.testnet,
};

export const NATIVE_TOKEN_DATA: Record<number, ChainMetadata['nativeCurrency']> = {
  [SupportedChains.ganache]: Ganache.testnet.nativeCurrency,
  [SupportedChains.bsc]: BSC.mainnet.nativeCurrency,
  [SupportedChains.chapel]: BSC.testnet.nativeCurrency,
  [SupportedChains.evmos_testnet]: Evmos.testnet.nativeCurrency,
  [SupportedChains.moonbeam]: Moonbeam.mainnet.nativeCurrency,
  [SupportedChains.moonbase_alpha]: Moonbeam.testnet.nativeCurrency,
};

export const isSupportedChainId = (chainId: number) => {
  return Object.keys(NETWORK_DATA).includes(chainId.toString());
};

export function getSupportedChainIds(): number[] {
  const supportedChains = getSupportedChains();
  return supportedChains.map((chain) => chain.chainId);
}

export function getSupportedChains(): ChainMetadata[] {
  return Object.values(NETWORK_DATA).filter((chainMetadata) => chainMetadata.supported);
}

export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  return Object.values(NETWORK_DATA).find((networkData) => networkData.chainId === chainId);
}

export function getScanUrlByChainId(chainId: number | SupportedChains): string | null {
  const chain = Object.values(NETWORK_DATA).filter(
    (chainMetadata) => chainMetadata.chainId === chainId
  );

  return chain.length !== 0 && chain[0].blockExplorerUrls.default
    ? chain[0].blockExplorerUrls.default.url
    : null;
}

export function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = Object.values(NETWORK_DATA).filter(
    (chainMetadata) => chainMetadata.chainId === chainId
  );
  return chain[0].blocksPerMin ? chain[0].blocksPerMin : 4;
}
