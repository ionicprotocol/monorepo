import {
  base,
  bob,
  chainIdToConfig,
  mode,
  optimism
} from '@ionicprotocol/chains';
import type {
  ChainConfig,
  ChainSupportedAssets as ChainSupportedAssetsType,
  DeployedPlugins as DeployedPluginsType
} from '@ionicprotocol/types';
import { SupportedChains } from '@ionicprotocol/types';
import { BigNumber } from 'ethers';

import { config } from '@ui/config/index';
import { MINUTES_PER_YEAR } from '@ui/constants/index';
import { supportedChainIdToConfig } from '@ui/types/ChainMetaData';

export const isSupportedChainId = (chainId: number) => {
  return getSupportedChainIds().includes(chainId);
};

export function getSupportedChainIds(): number[] {
  const supportedChains = getSupportedChains();

  return supportedChains.map((chain) => chain.chainId);
}

export function getSupportedChains(): ChainConfig[] {
  return Object.values(chainIdToConfig).filter(
    (chainMetadata) =>
      supportedChainIdToConfig[chainMetadata.chainId]?.supported
  );
}

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chainIdToConfig[chainId];
}

export function getScanUrlByChainId(
  chainId: SupportedChains | number
): string | null {
  const chain = chainIdToConfig[chainId];

  return chain && chain.specificParams.metadata.blockExplorerUrls.default
    ? chain.specificParams.metadata.blockExplorerUrls.default.url
    : null;
}

export function getBlockTimePerMinuteByChainId(chainId: number): number {
  const chain = chainIdToConfig[chainId];

  return chain
    ? chain.specificParams.blocksPerYear
        .div(BigNumber.from(MINUTES_PER_YEAR))
        .toNumber()
    : 0;
}

export function getEnabledChains() {
  const enabledChains: SupportedChains[] = [];

  if (config.isModeEnabled) {
    enabledChains.push(SupportedChains.mode);
  }

  if (config.isBaseEnabled) {
    enabledChains.push(SupportedChains.base);
  }

  if (config.isOptimismEnabled) {
    enabledChains.push(SupportedChains.optimism);
  }

  if (config.isBobEnabled) {
    enabledChains.push(SupportedChains.bob);
  }

  return enabledChains;
}

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.mode]: mode.assets,
  [SupportedChains.base]: base.assets,
  [SupportedChains.optimism]: optimism.assets,
  [SupportedChains.bob]: bob.assets
};

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.mode]: mode.deployedPlugins,
  [SupportedChains.base]: base.deployedPlugins,
  [SupportedChains.optimism]: optimism.deployedPlugins,
  [SupportedChains.bob]: bob.deployedPlugins
};
