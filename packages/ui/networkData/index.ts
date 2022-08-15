import { ChainConfig, SupportedChains } from '@midas-capital/types';
import { BigNumber } from 'ethers';

import { chainIdToConfig, supportedChainIdToConfig } from '@ui/types/ChainMetaData';

const MINUTES_PER_YEAR = 24 * 365 * 60;

export const isSupportedChainId = (chainId: number) => {
  return Object.keys(chainIdToConfig).includes(chainId.toString());
};

export function getSupportedChainIds(): number[] {
  const supportedChains = getSupportedChains();
  return supportedChains.map((chain) => chain.chainId);
}

export function getSupportedChains(): ChainConfig[] {
  return Object.values(chainIdToConfig).filter(
    (chainMetadata) => supportedChainIdToConfig[chainMetadata.chainId].supported
  );
}

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return Object.values(chainIdToConfig).find((networkData) => networkData.chainId === chainId);
}

export function getScanUrlByChainId(chainId: number | SupportedChains): string | null {
  const chain = Object.values(chainIdToConfig).filter(
    (chainMetadata) => chainMetadata.chainId === chainId
  );

  return chain.length !== 0 && chain[0].specificParams.metadata.blockExplorerUrls.default
    ? chain[0].specificParams.metadata.blockExplorerUrls.default.url
    : null;
}

export function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = Object.values(chainIdToConfig).filter(
    (chainMetadata) => chainMetadata.chainId === chainId
  );
  return chain[0].specificParams.blocksPerYear.div(BigNumber.from(MINUTES_PER_YEAR)).toNumber();
}
