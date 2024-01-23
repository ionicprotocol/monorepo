import { useMemo } from 'react';

import { getChainConfig, getEnabledChains } from '@ui/utils/networkData';

export function useCgId(chainId?: number) {
  return useMemo(() => {
    if (chainId) {
      const chainConfig = getChainConfig(chainId);

      return chainConfig ? chainConfig.specificParams.cgId : '';
    } else {
      return '';
    }
  }, [chainId]);
}

export function useChainConfig(chainId?: number) {
  return useMemo(() => {
    if (chainId) {
      const chainConfig = getChainConfig(chainId);

      return chainConfig;
    }
  }, [chainId]);
}

export function useEnabledChains() {
  return useMemo(() => {
    return getEnabledChains();
  }, []);
}
