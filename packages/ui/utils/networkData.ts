import {
  arbitrum,
  bsc,
  chainIdToConfig,
  chapel,
  ethereum,
  evmos,
  fantom,
  ganache,
  lineagoerli,
  moonbeam,
  neondevnet,
  polygon,
} from '@midas-capital/chains';
import type {
  ChainConfig,
  ChainSupportedAssets as ChainSupportedAssetsType,
  DeployedPlugins as DeployedPluginsType,
} from '@midas-capital/types';
import { SupportedChains } from '@midas-capital/types';
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
  if (config.isMoonbeamEnabled) {
    enabledChains.push(SupportedChains.moonbeam);
  }
  if (config.isArbitrumEnabled) {
    enabledChains.push(SupportedChains.arbitrum);
  }
  if (config.isFantomEnabled) {
    enabledChains.push(SupportedChains.fantom);
  }
  if (config.isEthereumEnabled) {
    enabledChains.push(SupportedChains.ethereum);
  }
  if (config.isEvmosEnabled) {
    enabledChains.push(SupportedChains.evmos);
  }

  if (config.isTestnetEnabled) {
    enabledChains.push(SupportedChains.neon_devnet);
    enabledChains.push(SupportedChains.chapel);
    enabledChains.push(SupportedChains.lineagoerli);
  }

  return enabledChains;
}

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.ganache]: ganache.assets,
  [SupportedChains.evmos]: evmos.assets,
  [SupportedChains.chapel]: chapel.assets,
  [SupportedChains.moonbeam]: moonbeam.assets,
  [SupportedChains.neon_devnet]: neondevnet.assets,
  [SupportedChains.arbitrum]: arbitrum.assets,
  [SupportedChains.fantom]: fantom.assets,
  [SupportedChains.lineagoerli]: lineagoerli.assets,
  [SupportedChains.ethereum]: ethereum.assets,
};

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.bsc]: bsc.deployedPlugins,
  [SupportedChains.polygon]: polygon.deployedPlugins,
  [SupportedChains.ganache]: ganache.deployedPlugins,
  [SupportedChains.evmos]: evmos.deployedPlugins,
  [SupportedChains.chapel]: chapel.deployedPlugins,
  [SupportedChains.moonbeam]: moonbeam.deployedPlugins,
  [SupportedChains.neon_devnet]: neondevnet.deployedPlugins,
  [SupportedChains.arbitrum]: arbitrum.deployedPlugins,
  [SupportedChains.fantom]: fantom.deployedPlugins,
  [SupportedChains.lineagoerli]: lineagoerli.deployedPlugins,
  [SupportedChains.ethereum]: ethereum.deployedPlugins,
};
