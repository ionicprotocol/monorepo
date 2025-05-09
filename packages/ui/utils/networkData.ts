import {
  mode as vMode,
  base as vBase,
  optimism as vOptimism,
  bob as vBob,
  fraxtal as vFraxtal,
  lisk as vLisk,
  superseed as vSuperseed,
  worldchain as vWorldchain,
  metalL2 as vMetalL2
} from 'viem/chains';

import { config } from '@ui/config/index';
import { MINUTES_PER_YEAR } from '@ui/constants/index';
import { supportedChainIdToConfig } from '@ui/types/ChainMetaData';

import {
  base,
  chainIdToConfig,
  mode,
  optimism,
  bob,
  fraxtal,
  lisk,
  superseed,
  worldchain,
  ink,
  vInk,
  swellchain,
  vSwellchain,
  camptest,
  vCampTest,
  ozeantest,
  vOzeantest,
  soneium,
  vSoneium,
  metalL2
} from '@ionicprotocol/chains';
import { SupportedChains } from '@ionicprotocol/types';
import type {
  ChainConfig,
  ChainSupportedAssets as ChainSupportedAssetsType,
  DeployedPlugins as DeployedPluginsType
} from '@ionicprotocol/types';

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
    ? Number(
        BigInt(chain.specificParams.blocksPerYear) / BigInt(MINUTES_PER_YEAR)
      )
    : 0;
}

export function getEnabledChains() {
  const enabledChains = [];

  if (config.isModeEnabled) {
    enabledChains.push(vMode);
  }

  if (config.isBaseEnabled) {
    enabledChains.push(vBase);
  }

  if (config.isOptimismEnabled) {
    enabledChains.push(vOptimism);
  }

  if (config.isBobEnabled) {
    enabledChains.push(vBob);
  }

  if (config.isFraxtalEnabled) {
    enabledChains.push(vFraxtal);
  }

  if (config.isLiskEnabled) {
    enabledChains.push(vLisk);
  }

  if (config.isSuperseedEnabled) {
    enabledChains.push(vSuperseed);
  }

  if (config.isWorldchainEnabled) {
    enabledChains.push(vWorldchain);
  }

  if (config.isInkEnabled) {
    enabledChains.push(vInk);
  }

  if (config.isSwellEnabled) {
    enabledChains.push(vSwellchain);
  }

  if (config.isCampTestEnabled) {
    enabledChains.push(vCampTest);
  }

  if (config.isOzeantestEnabled) {
    enabledChains.push(vOzeantest);
  }

  if (config.isSoneiumEnabled) {
    enabledChains.push(vSoneium);
  }

  if (config.isMetalL2Enabled) {
    enabledChains.push(vMetalL2);
  }

  return enabledChains;
}

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.mode]: mode.assets,
  [SupportedChains.base]: base.assets,
  [SupportedChains.optimism]: optimism.assets,
  [SupportedChains.bob]: bob.assets,
  [SupportedChains.fraxtal]: fraxtal.assets,
  [SupportedChains.lisk]: lisk.assets,
  [SupportedChains.superseed]: superseed.assets,
  [SupportedChains.worldchain]: worldchain.assets,
  [SupportedChains.ink]: ink.assets,
  [SupportedChains.swell]: swellchain.assets,
  [SupportedChains.camptest]: camptest.assets,
  [SupportedChains.ozeantest]: ozeantest.assets,
  [SupportedChains.soneium]: soneium.assets,
  [SupportedChains.metalL2]: metalL2.assets
};

export const deployedPlugins: { [chainId: string]: DeployedPluginsType } = {
  [SupportedChains.mode]: mode.deployedPlugins,
  [SupportedChains.base]: base.deployedPlugins,
  [SupportedChains.optimism]: optimism.deployedPlugins,
  [SupportedChains.bob]: bob.deployedPlugins,
  [SupportedChains.fraxtal]: fraxtal.deployedPlugins,
  [SupportedChains.lisk]: lisk.deployedPlugins,
  [SupportedChains.superseed]: superseed.deployedPlugins,
  [SupportedChains.worldchain]: worldchain.deployedPlugins,
  [SupportedChains.ink]: ink.deployedPlugins,
  [SupportedChains.swell]: swellchain.deployedPlugins,
  [SupportedChains.soneium]: soneium.deployedPlugins,
  [SupportedChains.camptest]: camptest.deployedPlugins,
  [SupportedChains.ozeantest]: ozeantest.deployedPlugins,
  [SupportedChains.metalL2]: metalL2.deployedPlugins
};
