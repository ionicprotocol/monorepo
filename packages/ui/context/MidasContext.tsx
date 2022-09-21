import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink } from '@chakra-ui/react';
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

import { useColors } from '@ui/hooks/useColors';
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

  const { cPage } = useColors();

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
            title: <>Pending!</>,
            description: <>Transaction is pending now.</>,
          });
          const res = await tx.wait();

          if (res.blockNumber) {
            mounted.current && setFinishedTxHash(hash);
            await queryClient.refetchQueries();
            successToast({
              title: <>Complete!</>,
              description: (
                <Button
                  href={`${scanUrl}/tx/${tx.hash}`}
                  rightIcon={<ExternalLinkIcon />}
                  color={cPage.primary.bgColor}
                  variant={'link'}
                  as={ChakraLink}
                  isExternal
                  width="100%"
                  py={2}
                >
                  View Transaction
                </Button>
              ),
            });
          }
        }
      } catch (e) {
        handleGenericError(e, errorToast);
        mounted.current && setFinishedTxHash(hash);
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
