import { JsonRpcProvider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import { SupportedChains } from '@midas-capital/types';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { chainIdToConfig } from '@ui/types/ChainMetaData';

export interface MultiMidasContextData {
  sdks: Partial<Record<SupportedChains, MidasSdk>>;
  chainIds: string[];
}

export const MultiMidasContext = createContext<MultiMidasContextData | undefined>(undefined);

interface MultiMidasProviderProps {
  children: ReactNode;
}

export const MultiMidasProvider = ({ children }: MultiMidasProviderProps = { children: null }) => {
  const enabledChains = useEnabledChains();
  const sdks = useMemo(() => {
    const newSDKs: Partial<Record<SupportedChains, MidasSdk>> = {};
    enabledChains.forEach((chainId) => {
      const config = chainIdToConfig[chainId];
      newSDKs[chainId] = new MidasSdk(
        new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default),
        chainIdToConfig[Number(chainId)]
      );
    });

    return newSDKs;
  }, [enabledChains]);

  const chainIds = useMemo(() => Object.keys(sdks).sort(), [sdks]);

  const value = useMemo(() => {
    return {
      sdks,
      chainIds,
    };
  }, [sdks, chainIds]);

  return <MultiMidasContext.Provider value={value}>{children}</MultiMidasContext.Provider>;
};

// Hook
export function useMultiMidas() {
  const context = useContext(MultiMidasContext);

  if (context === undefined) {
    throw new Error(`useMultiMidas must be used within a MultiMidasProvider`);
  }

  return context;
}
