'use client';
import { JsonRpcProvider } from '@ethersproject/providers';
import { chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import Security from '@ionicprotocol/security';
import type { SupportedChains } from '@ionicprotocol/types';
import * as Sentry from '@sentry/browser';
import type { providers } from 'ethers';
import type { Dispatch, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { Chain } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';

import { MIDAS_LOCALSTORAGE_KEYS } from '@ui/constants/index';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useEthersSigner } from '@ui/hooks/useEthersSigner';

export interface MultiIonicContextData {
  address?: `0x${string}`;
  chainIds: SupportedChains[];
  currentChain?: Chain & {
    unsupported?: boolean | undefined;
  };
  currentSdk?: IonicSdk;
  disconnect: () => void;
  getSdk: (chainId: number) => IonicSdk | undefined;
  getSecurity: (chainId: number) => Security | undefined;
  isConnected: boolean;
  isGlobalLoading: boolean;
  isSidebarCollapsed: boolean | undefined;
  sdks: IonicSdk[];
  securities: Security[];
  setAddress: Dispatch<`0x${string}`>;
  setGlobalLoading: Dispatch<boolean>;
  setIsSidebarCollapsed: Dispatch<boolean>;
  signer?: providers.JsonRpcSigner;
}

export const MultiIonicContext = createContext<
  MultiIonicContextData | undefined
>(undefined);

interface MultiIonicProviderProps {
  children: ReactNode;
}

export const MultiIonicProvider = (
  { children }: MultiIonicProviderProps = { children: null }
) => {
  const enabledChains = useEnabledChains();
  // const { chain, chains } = useNetwork();
  const { address: wagmiAddress, chain, isConnected } = useAccount();

  // const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  // const { isLoading: isNetworkLoading, isIdle, switchNetworkAsync } = useSwitchNetwork();
  const signer = useEthersSigner();
  const { disconnect } = useDisconnect();
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [currentChain, setCurrentChain] = useState<
    | (Chain & {
        unsupported?: boolean | undefined;
      })
    | undefined
  >();
  const [isGlobalLoading, setGlobalLoading] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>();

  const [sdks, securities, chainIds] = useMemo(() => {
    const _sdks: IonicSdk[] = [];
    const _securities: Security[] = [];
    const _chainIds: SupportedChains[] = [];
    enabledChains.map((chainId) => {
      const config = chainIdToConfig[chainId];
      _sdks.push(
        new IonicSdk(
          new JsonRpcProvider(
            config.specificParams.metadata.rpcUrls.default.http[0]
          ),
          config
        )
      );
      _securities.push(
        new Security(
          chainId,
          new JsonRpcProvider(
            config.specificParams.metadata.rpcUrls.default.http[0]
          )
        )
      );
      _chainIds.push(chainId);
    });

    return [_sdks, _securities, _chainIds.sort()];
  }, [enabledChains]);

  const currentSdk = useMemo(() => {
    if (chain) {
      return sdks.find((sdk) => sdk.chainId === chain.id);
    }
  }, [sdks, chain]);

  const getSdk = useCallback(
    (chainId: number) => {
      return sdks.find((sdk) => sdk.chainId === chainId);
    },
    [sdks]
  );

  const getSecurity = useCallback(
    (chainId: number) =>
      securities.find((security) => security.chainConfig.chainId === chainId),
    [securities]
  );

  useEffect(() => {
    if (currentSdk && signer) {
      currentSdk.setSigner(signer);
    }
  }, [signer, currentSdk]);

  useEffect(() => {
    if (sdks.length > 0 && !signer) {
      sdks.map((sdk) => {
        const config = chainIdToConfig[sdk.chainId];
        sdk.removeSigner(
          new JsonRpcProvider(
            config.specificParams.metadata.rpcUrls.default.http[0]
          )
        );
      });
    }
  }, [signer, sdks]);

  useEffect(() => {
    if (wagmiAddress) {
      Sentry.setUser({ id: wagmiAddress });
    }

    setAddress(wagmiAddress);
  }, [wagmiAddress]);

  useEffect(() => {
    setCurrentChain(chain);
  }, [chain]);

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
    if (oldData && JSON.parse(oldData).isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    if (isSidebarCollapsed !== undefined) {
      const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
      let oldObj;
      if (oldData) {
        oldObj = JSON.parse(oldData);
      }
      const data = { ...oldObj, isSidebarCollapsed };
      localStorage.setItem(MIDAS_LOCALSTORAGE_KEYS, JSON.stringify(data));
    }
  }, [isSidebarCollapsed]);

  const value = useMemo(() => {
    return {
      address,
      chainIds,
      currentChain,
      currentSdk,
      disconnect,
      getSdk,
      getSecurity,
      isConnected,
      isGlobalLoading,
      isSidebarCollapsed,
      sdks,
      securities,
      setAddress,
      setGlobalLoading,
      setIsSidebarCollapsed,
      signer
    };
  }, [
    sdks,
    securities,
    getSecurity,
    chainIds,
    isGlobalLoading,
    setGlobalLoading,
    currentChain,
    currentSdk,
    getSdk,
    address,
    disconnect,
    isConnected,
    signer,
    setAddress,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  ]);

  return (
    <MultiIonicContext.Provider value={value}>
      {children}
    </MultiIonicContext.Provider>
  );
};

// Hook
export function useMultiMidas() {
  const context = useContext(MultiIonicContext);

  if (context === undefined) {
    throw new Error(`useMultiMidas must be used within a MultiMidasProvider`);
  }

  return context;
}
