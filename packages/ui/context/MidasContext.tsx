import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, HStack, Text, VStack } from '@chakra-ui/react';
import { Provider, Web3Provider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Chain } from 'wagmi';

import { useErrorToast, useInfoToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { initFuseWithProviders } from '@ui/utils/web3Providers';

export interface MidasContextData {
  midasSdk: MidasSdk;
  scanUrl: string | null;
  viewMode: string;
  setViewMode: Dispatch<string>;
  loading: boolean;
  setLoading: Dispatch<boolean>;
  pendingTxHash: string;
  setPendingTxHash: Dispatch<string>;
  pendingTxHashes: string[];
  setPendingTxHashes: Dispatch<string[]>;
  accountBtnElement: MutableRefObject<HTMLButtonElement | undefined>;
  networkBtnElement: MutableRefObject<HTMLButtonElement | undefined>;
  currentChain: Chain & {
    id: number;
    unsupported?: boolean | undefined;
  };
  chains: Chain[];
  address: string;
  disconnect: () => void;
  coingeckoId: string;
}

export const MidasContext = createContext<MidasContextData | undefined>(undefined);

interface MidasProviderProps {
  children: ReactNode;
  currentChain: Chain & {
    id: number;
    unsupported?: boolean | undefined;
  };
  chains: Chain[];
  signerProvider: Provider;
  address: string;
  disconnect: () => void;
}
export const MidasProvider = ({
  children,
  currentChain,
  chains,
  signerProvider,
  address,
  disconnect,
}: MidasProviderProps) => {
  const midasSdk = useMemo(() => {
    return initFuseWithProviders(signerProvider as Web3Provider, currentChain.id);
  }, [signerProvider, currentChain.id]);
  const scanUrl = getScanUrlByChainId(currentChain.id);
  const [viewMode, setViewMode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingTxHashes, setPendingTxHashes] = useState<string[]>([]);
  const [pendingTxHash, setPendingTxHash] = useState<string>('');
  const [finishedTxHash, setFinishedTxHash] = useState<string>('');

  const accountBtnElement = useRef<HTMLButtonElement>();
  const networkBtnElement = useRef<HTMLButtonElement>();

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const infoToast = useInfoToast();

  const queryClient = useQueryClient();

  const mounted = useRef(false);

  const coingeckoId = midasSdk.chainSpecificParams.cgId;

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
      try {
        const tx = await midasSdk.provider.getTransaction(hash);
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
              id: 'toast-success',
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
    };

    if (pendingTxHash) {
      mounted.current &&
        !pendingTxHashes.includes(pendingTxHash) &&
        setPendingTxHashes([...pendingTxHashes, pendingTxHash]);
      pendingFunc(pendingTxHash);
      setPendingTxHash('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTxHash, midasSdk, address]);

  useEffect(() => {
    if (mounted.current) {
      setPendingTxHashes((pendingTxHashes) =>
        [...pendingTxHashes].filter((hash) => {
          return hash !== finishedTxHash;
        })
      );
    }
  }, [finishedTxHash]);

  const value = useMemo(() => {
    return {
      midasSdk,
      scanUrl,
      viewMode,
      setViewMode,
      loading,
      setLoading,
      pendingTxHash,
      setPendingTxHash,
      pendingTxHashes,
      setPendingTxHashes,
      accountBtnElement,
      networkBtnElement,
      currentChain,
      chains,
      address,
      disconnect,
      coingeckoId,
    };
  }, [
    midasSdk,
    scanUrl,
    viewMode,
    setViewMode,
    loading,
    setLoading,
    pendingTxHash,
    setPendingTxHash,
    pendingTxHashes,
    setPendingTxHashes,
    accountBtnElement,
    networkBtnElement,
    currentChain,
    chains,
    address,
    disconnect,
    coingeckoId,
  ]);

  return <MidasContext.Provider value={value}>{children}</MidasContext.Provider>;
};

// Hook
export function useMidas() {
  const context = useContext(MidasContext);

  if (context === undefined) {
    throw new Error(`useMidas must be used within a MidasProvider`);
  }

  return context;
}
