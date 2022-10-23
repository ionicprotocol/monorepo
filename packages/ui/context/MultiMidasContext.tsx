import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, HStack, Text, VStack } from '@chakra-ui/react';
import { JsonRpcProvider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import Security from '@midas-capital/security';
import { SupportedChains } from '@midas-capital/types';
import { useQueryClient } from '@tanstack/react-query';
import { FetchSignerResult, Signer } from '@wagmi/core';
import {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Chain, useAccount, useDisconnect, useNetwork, useSigner } from 'wagmi';

import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useErrorToast, useInfoToast, useSuccessToast } from '@ui/hooks/useToast';
import { chainIdToConfig } from '@ui/types/ChainMetaData';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export interface MultiMidasContextData {
  sdks: MidasSdk[];
  securities: Security[];
  getSecurity: (chainId: number) => Security | undefined;
  chainIds: SupportedChains[];
  isGlobalLoading: boolean;
  setGlobalLoading: Dispatch<boolean>;
  currentChain?: Chain & {
    unsupported?: boolean | undefined;
  };
  currentSdk?: MidasSdk;
  getSdk: (chainId: number) => MidasSdk | undefined;
  address?: string;
  pendingTxHash: string;
  setPendingTxHash: Dispatch<string>;
  pendingTxHashes: string[];
  setPendingTxHashes: Dispatch<string[]>;
  disconnect: () => void;
  isConnected: boolean;
  signer?: FetchSignerResult<Signer>;
}

export const MultiMidasContext = createContext<MultiMidasContextData | undefined>(undefined);

interface MultiMidasProviderProps {
  children: ReactNode;
}

export const MultiMidasProvider = ({ children }: MultiMidasProviderProps = { children: null }) => {
  const enabledChains = useEnabledChains();
  const { chain } = useNetwork();
  // const { chain, chains } = useNetwork();
  const { address: wagmiAddress, isConnected } = useAccount();
  // const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  // const { isLoading: isNetworkLoading, isIdle, switchNetworkAsync } = useSwitchNetwork();
  const { data: signer } = useSigner();
  const { disconnect } = useDisconnect();
  const [address, setAddress] = useState<string | undefined>();
  const [currentChain, setCurrentChain] = useState<
    | (Chain & {
        unsupported?: boolean | undefined;
      })
    | undefined
  >();
  const [isGlobalLoading, setGlobalLoading] = useState<boolean>(false);
  const [pendingTxHashes, setPendingTxHashes] = useState<string[]>([]);
  const [pendingTxHash, setPendingTxHash] = useState<string>('');
  const [finishedTxHash, setFinishedTxHash] = useState<string>('');
  const mounted = useRef(false);
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();
  const queryClient = useQueryClient();

  const [sdks, securities, chainIds] = useMemo(() => {
    const _sdks: MidasSdk[] = [];
    const _securities: Security[] = [];
    const _chainIds: SupportedChains[] = [];
    enabledChains.map((chainId) => {
      const config = chainIdToConfig[chainId];
      _sdks.push(
        new MidasSdk(new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default), config)
      );
      _securities.push(
        new Security(chainId, new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default))
      );
      _chainIds.push(chainId);
    });

    return [_sdks, _securities, _chainIds.sort()];
  }, [enabledChains]);

  const currentSdk = useMemo(() => {
    if (chain && !chain.unsupported) {
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
    (chainId: number) => securities.find((security) => security.chainConfig.chainId === chainId),
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
        sdk.removeSigner(new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default));
      });
    }
  }, [signer, sdks]);

  useEffect(() => {
    mounted.current = true;

    const pendingStr = localStorage.getItem('pendingTxHashes');
    const pending: string[] = pendingStr !== null ? JSON.parse(pendingStr) : [];
    if (pending.length !== 0) {
      pending.map((hash: string) => {
        mounted.current && setPendingTxHash(hash);
      });
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pendingTxHashes', JSON.stringify(pendingTxHashes));
  }, [pendingTxHashes]);

  useEffect(() => {
    const pendingFunc = async (hash: string) => {
      if (currentSdk && address && chain) {
        const scanUrl = getScanUrlByChainId(chain.id);
        try {
          const tx = await currentSdk.provider.getTransaction(hash);
          if (tx.from === address) {
            infoToast({
              title: (
                <Text variant="toastLgText" fontWeight="bold">
                  Complete!
                </Text>
              ),
              description: <Text variant="toastSmText">Transaction is pending now.</Text>,
            });
            const res = await tx.wait();

            if (res.blockNumber) {
              mounted.current && setFinishedTxHash(hash);
              successToast({
                id: 'completedTx',
                title: (
                  <Text variant="toastLgText" fontWeight="bold">
                    Complete!
                  </Text>
                ),
                description: (
                  <VStack alignItems="flex-start" mt={1} spacing={0}>
                    <HStack>
                      <Text variant="toastSmText">Your can check transaction </Text>
                      <Button
                        href={`${scanUrl}/tx/${tx.hash}`}
                        rightIcon={<ExternalLinkIcon />}
                        variant="panelLink"
                        as={ChakraLink}
                        p={0}
                        height={3}
                        isExternal
                      >
                        here
                      </Button>
                    </HStack>
                    <HStack>
                      <Text variant="toastSmText">Your data is being updated! Please wait...</Text>
                    </HStack>
                  </VStack>
                ),
              });
              await queryClient.refetchQueries();
              successToast({
                id: 'updated',
                title: (
                  <Text variant="toastLgText" fontWeight="bold">
                    Complete!
                  </Text>
                ),
                description: <Text variant="toastSmText">Data is fully updated!</Text>,
              });
            }
          }
        } catch (e) {
          mounted.current && setFinishedTxHash(hash);
          handleGenericError(e, errorToast);
        }
      }
    };

    if (pendingTxHash && currentSdk && address && chain) {
      mounted.current &&
        !pendingTxHashes.includes(pendingTxHash) &&
        setPendingTxHashes([...pendingTxHashes, pendingTxHash]);
      pendingFunc(pendingTxHash);
      setPendingTxHash('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTxHash, currentSdk, address, chain]);

  useEffect(() => {
    if (mounted.current) {
      setPendingTxHashes((pendingTxHashes) =>
        [...pendingTxHashes].filter((hash) => {
          return hash !== finishedTxHash;
        })
      );
    }
  }, [finishedTxHash]);

  useEffect(() => {
    setAddress(wagmiAddress);
  }, [wagmiAddress]);

  useEffect(() => {
    setCurrentChain(chain);
  }, [chain]);

  const value = useMemo(() => {
    return {
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
      pendingTxHash,
      pendingTxHashes,
      setPendingTxHash,
      setPendingTxHashes,
      disconnect,
      isConnected,
      signer,
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
    pendingTxHash,
    pendingTxHashes,
    setPendingTxHash,
    setPendingTxHashes,
    disconnect,
    isConnected,
    signer,
  ]);

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
