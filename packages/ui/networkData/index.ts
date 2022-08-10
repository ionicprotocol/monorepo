import { SupportedChains } from '@midas-capital/types';

import BSC from '@ui/networkData/networks/BSC';
import Ganache from '@ui/networkData/networks/Ganache';
import Moonbeam from '@ui/networkData/networks/Moonbeam';
import NeonDevnet from '@ui/networkData/networks/NeonDevnet';
import Polygon from '@ui/networkData/networks/Polygon';
import { ChainMetadata } from '@ui/types/ChainMetaData';

export const NETWORK_DATA: Record<string, ChainMetadata> = {
  [SupportedChains.ganache]: Ganache.testnet,
  [SupportedChains.bsc]: BSC.mainnet,
  [SupportedChains.chapel]: BSC.testnet,
  [SupportedChains.moonbeam]: Moonbeam.mainnet,
  [SupportedChains.neon_devnet]: NeonDevnet.devnet,
  [SupportedChains.polygon]: Polygon.mainnet,
};

export const WRAPPED_NATIVE_TOKEN_DATA: Record<number, ChainMetadata['wrappedNativeCurrency']> = {
  [SupportedChains.ganache]: Ganache.testnet.wrappedNativeCurrency,
  [SupportedChains.bsc]: BSC.mainnet.wrappedNativeCurrency,
  [SupportedChains.chapel]: BSC.testnet.wrappedNativeCurrency,
  [SupportedChains.moonbeam]: Moonbeam.mainnet.wrappedNativeCurrency,
  [SupportedChains.neon_devnet]: NeonDevnet.devnet.wrappedNativeCurrency,
  [SupportedChains.polygon]: Polygon.mainnet.wrappedNativeCurrency,
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
