'use client';
import type { Dispatch, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import * as Sentry from '@sentry/browser';
import {
  createPublicClient,
  fallback,
  http,
  type Chain,
  type WalletClient
} from 'viem';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';

import { MIDAS_LOCALSTORAGE_KEYS } from '@ui/constants/index';
import { useBaseRpcUrl } from '@ui/hooks/useBaseRpcUrl';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

import { chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import type Security from '@ionicprotocol/security';
import type { SupportedChains } from '@ionicprotocol/types';

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
  walletClient?: WalletClient;
  dropChain: string;
  setDropChain: (val: string) => void;
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
  const baseRpc = useBaseRpcUrl();
  const base = baseRpc.baseChain;

  // const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  // const { isLoading: isNetworkLoading, isIdle, switchNetworkAsync } = useSwitchNetwork();
  const { data: walletClient } = useWalletClient();
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
  const [dropChain, setDropChain] = useState<string>('34443');

  const [sdks, securities, chainIds] = useMemo(() => {
    const _sdks: IonicSdk[] = [];
    const _securities: Security[] = [];
    const _chainIds: SupportedChains[] = [];
    enabledChains.map((chain) => {
      const chainConfig = chainIdToConfig[chain.id];
      const _walletClient =
        chain.id === walletClient?.chain?.id ? walletClient : undefined;

      const transportUrls =
        chainConfig.specificParams.metadata.rpcUrls.default.http;

      const client = createPublicClient({
        batch: { multicall: { wait: 16 } },
        chain,
        transport: fallback(transportUrls.map((url) => http(url)))
      });
      _sdks.push(new IonicSdk(client as any, _walletClient, chainConfig));
      // _securities.push(
      //   new Security(
      //     chain.id,
      //     new JsonRpcProvider(
      //       config.specificParams.metadata.rpcUrls.default.http[0]
      //     )
      //   )
      // );
      _chainIds.push(chain.id);
    });

    return [_sdks, _securities, _chainIds.sort()];
  }, [enabledChains, walletClient]);

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
    if (
      currentSdk &&
      walletClient &&
      currentSdk?.chainId === walletClient.chain.id
    ) {
      currentSdk.setWalletClient(walletClient as any);
    }
  }, [walletClient, currentSdk]);

  useEffect(() => {
    if (sdks.length > 0 && !walletClient) {
      sdks.map((sdk) => {
        const sdkConfig = chainIdToConfig[sdk.chainId];
        let rpcUrl = sdkConfig.specificParams.metadata.rpcUrls.default.http[0];

        // Use custom RPC URL for Base
        if (sdk.chainId === 8453) {
          rpcUrl = base.rpcUrls.default.http[0];
        }

        sdk.removeWalletClient(
          createPublicClient({
            chain,
            transport: http(rpcUrl)
          })
        );
      });
    }
  }, [walletClient, sdks, chain, base]);

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
      walletClient,
      dropChain,
      setDropChain
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
    walletClient,
    setAddress,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    dropChain,
    setDropChain
  ]);

  return (
    <MultiIonicContext.Provider value={value as any}>
      {children}
    </MultiIonicContext.Provider>
  );
};

// Hook
export function useMultiIonic() {
  const context = useContext(MultiIonicContext);

  if (context === undefined) {
    throw new Error(`useMultiIonic must be used within a MultiIonicProvider`);
  }

  return context;
}
