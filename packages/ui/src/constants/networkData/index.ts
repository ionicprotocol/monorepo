import { SupportedChains } from '@midas-capital/sdk';

import BSC from '@constants/networkData/BSC';
import Evmos from '@constants/networkData/Evmos';
import Ganache from '@constants/networkData/Ganache';

type BlockExplorerUrl = {
  name: string;
  url: string;
};
export interface ChainMetadata {
  chainId: number;
  chainIdHex: string;
  shortName: string;
  name: string;
  img: string;
  /** User can use this network */
  enabled: boolean;
  /** Same as enabled? */
  supported: boolean;
  blocksPerMin: number;
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<BlockExplorerUrl>;
  nativeCurrency: {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    color: string;
    overlayTextColor: string;
    logoURL: string;
    coingeckoId: string;
  };
  testnet?: boolean | undefined;
}

export const NETWORK_DATA: Record<string, ChainMetadata> = {
  [SupportedChains.ganache]: Ganache.testnet,
  [SupportedChains.bsc]: BSC.mainnet,
  [SupportedChains.chapel]: BSC.testnet,
  [SupportedChains.evmos_testnet]: Evmos.testnet,
};

export const NATIVE_TOKEN_DATA: Record<number, ChainMetadata['nativeCurrency']> = {
  [SupportedChains.ganache]: Ganache.testnet.nativeCurrency,
  [SupportedChains.bsc]: BSC.mainnet.nativeCurrency,
  [SupportedChains.chapel]: BSC.testnet.nativeCurrency,
  [SupportedChains.evmos_testnet]: Evmos.testnet.nativeCurrency,
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

  return chain.length !== 0 && chain[0].blockExplorerUrls
    ? chain[0].blockExplorerUrls[0].url
    : null;
}

export function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = Object.values(NETWORK_DATA).filter(
    (chainMetadata) => chainMetadata.chainId === chainId
  );
  return chain[0].blocksPerMin ? chain[0].blocksPerMin : 4;
}

export interface AddChainMetadata {
  chainId: string;
  chainName: string;
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<string> | null;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

interface AddEthereumChainParameter {
  chainId: string;
  blockExplorerUrls?: Array<BlockExplorerUrl>;
  chainName: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
}
export function createAddEthereumChainParams(
  chainMetadata: ChainMetadata
): AddEthereumChainParameter {
  return {
    chainId: chainMetadata.chainIdHex,
    chainName: chainMetadata.name,
    nativeCurrency: {
      name: chainMetadata.nativeCurrency.name,
      symbol: chainMetadata.nativeCurrency.symbol,
      decimals: chainMetadata.nativeCurrency.decimals,
    },
    rpcUrls: chainMetadata.rpcUrls,
    blockExplorerUrls: chainMetadata.blockExplorerUrls,
  };
}
