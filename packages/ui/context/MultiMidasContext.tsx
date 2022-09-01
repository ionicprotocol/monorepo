import { JsonRpcProvider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import { SupportedChains } from '@midas-capital/types';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { chainIdToConfig } from '../types/ChainMetaData';

export interface MultiMidasContextData {
  sdks: Partial<Record<SupportedChains, MidasSdk>>;
}

export const MultiMidasContext = createContext<MultiMidasContextData | undefined>(undefined);

interface MultiMidasProviderProps {
  children: ReactNode;
}

const ENABLED_CHAINS: SupportedChains[] = [56, 137];
export const MultiMidasProvider = ({ children }: MultiMidasProviderProps = { children: null }) => {
  const sdks = useMemo(() => {
    const newSDKs: Partial<Record<SupportedChains, MidasSdk>> = {};
    ENABLED_CHAINS.forEach((chainId) => {
      const config = chainIdToConfig[chainId];
      newSDKs[chainId] = new MidasSdk(
        new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default),
        chainIdToConfig[Number(chainId)]
      );
    });
    return newSDKs;
  }, []);

  return <MultiMidasContext.Provider value={{ sdks }}>{children}</MultiMidasContext.Provider>;
};

// Hook
export function useMultiMidas() {
  const context = useContext(MultiMidasContext);

  if (context === undefined) {
    throw new Error(`useMultiMidas must be used within a MultiMidasProvider`);
  }

  return context;
}
