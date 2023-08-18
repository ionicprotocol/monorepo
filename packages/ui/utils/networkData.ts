import {
  arbitrum,
  bsc,
  chainIdToConfig,
  chapel,
  ethereum,
  ganache,
  linea,
  neon,
  polygon,
  zkevm
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
    (chainMetadata) => supportedChainIdToConfig[chainMetadata.chainId].supported
  );
}

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chainIdToConfig[chainId];
}

export function getScanUrlByChainId(chainId: SupportedChains | number): string | null {
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
  if (config.isArbitrumEnabled) {
    enabledChains.push(SupportedChains.arbitrum);
  }
  if (config.isEthereumEnabled) {
    enabledChains.push(SupportedChains.ethereum);
  }
  if (config.isZkevmEnabled) {
    enabledChains.push(SupportedChains.zkevm);
  }
  if (config.isLineaEnabled) {
    enabledChains.push(SupportedChains.linea);
  }
  if (config.isNeonEnabled) {
    enabledChains.push(SupportedChains.neon);
  }
  if (config.isTestnetEnabled) {
    enabledChains.push(SupportedChains.chapel);
  }

  return enabledChains;
}

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.ganache]: ganache.assets,
  [SupportedChains.chapel]: chapel.assets,
  [SupportedChains.neon]: neon.assets,
  [SupportedChains.arbitrum]: arbitrum.assets,
  [SupportedChains.linea]: linea.assets,
  [SupportedChains.ethereum]: ethereum.assets,
  [SupportedChains.zkevm]: zkevm.assets
};

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.bsc]: bsc.deployedPlugins,
  [SupportedChains.polygon]: polygon.deployedPlugins,
  [SupportedChains.ganache]: ganache.deployedPlugins,
  [SupportedChains.chapel]: chapel.deployedPlugins,
  [SupportedChains.neon]: neon.deployedPlugins,
  [SupportedChains.arbitrum]: arbitrum.deployedPlugins,
  [SupportedChains.linea]: linea.deployedPlugins,
  [SupportedChains.ethereum]: ethereum.deployedPlugins,
  [SupportedChains.zkevm]: zkevm.deployedPlugins
};
