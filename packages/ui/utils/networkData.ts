import {
  arbitrum,
  base,
  bsc,
  chainIdToConfig,
  chapel,
  ethereum,
  ganache,
  linea,
  mode,
  neon,
  polygon,
  zkevm,
  sepolia
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

  return enabledChains;
}

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.ethereum]: ethereum.assets,
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.chapel]: chapel.assets,
  [SupportedChains.ganache]: ganache.assets,
  [SupportedChains.neon]: neon.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.arbitrum]: arbitrum.assets,
  [SupportedChains.linea]: linea.assets,
  [SupportedChains.zkevm]: zkevm.assets,
  [SupportedChains.mode]: mode.assets,
  [SupportedChains.base]: base.assets,
  [SupportedChains.sepolia]: sepolia.assets
};

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.bsc]: bsc.deployedPlugins,
  [SupportedChains.polygon]: polygon.deployedPlugins,
  [SupportedChains.ganache]: ganache.deployedPlugins,
  [SupportedChains.chapel]: chapel.deployedPlugins,
  [SupportedChains.arbitrum]: arbitrum.deployedPlugins,
  [SupportedChains.ethereum]: ethereum.deployedPlugins,
  [SupportedChains.mode]: mode.deployedPlugins,
  [SupportedChains.base]: base.deployedPlugins
};
