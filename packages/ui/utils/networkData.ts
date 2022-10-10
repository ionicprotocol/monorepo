import { ChainConfig, SupportedChains } from '@midas-capital/types';
import { BigNumber } from 'ethers';

import { config } from '@ui/config/index';
import { MINUTES_PER_YEAR } from '@ui/constants/index';
import { chainIdToConfig, supportedChainIdToConfig } from '@ui/types/ChainMetaData';

export const isSupportedChainId = (chainId: number) => {
  return getSupportedChainIds().includes(chainId);
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
  return chainIdToConfig[chainId];
}

export function getScanUrlByChainId(chainId: number | SupportedChains): string | null {
  const chain = chainIdToConfig[chainId];

  return chain && chain.specificParams.metadata.blockExplorerUrls.default
    ? chain.specificParams.metadata.blockExplorerUrls.default.url
    : null;
}

export function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = chainIdToConfig[chainId];

  return chain
    ? chain.specificParams.blocksPerYear.div(BigNumber.from(MINUTES_PER_YEAR)).toNumber()
    : 0;
}

export function getEnabledChains() {
  const enabledChains: SupportedChains[] = [];

  if (config.isBscEnabled) {
    enabledChains.push(SupportedChains.bsc);
  }
  if (config.isPolygonEnabled) {
    enabledChains.push(SupportedChains.polygon);
  }
  if (config.isMoonbeamEnabled) {
    enabledChains.push(SupportedChains.moonbeam);
  }

  return enabledChains;
}
