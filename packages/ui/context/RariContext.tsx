import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Link as ChakraLink, useToast } from '@chakra-ui/react';
import { Provider, Web3Provider } from '@ethersproject/providers';
import { Fuse } from '@midas-capital/sdk';
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
import { useQueryClient } from 'react-query';
import { Chain } from 'wagmi';

import { useColors } from '@ui/hooks/useColors';
import { getScanUrlByChainId, WRAPPED_NATIVE_TOKEN_DATA } from '@ui/networkData/index';
import { handleGenericError } from '@ui/utils/errorHandling';
import { initFuseWithProviders } from '@ui/utils/web3Providers';
export interface RariContextData {
  fuse: Fuse;
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
  addressIcons: { [key: string]: string };
}

export const RariContext = createContext<RariContextData | undefined>(undefined);

export const RariProvider = ({
  children,
  currentChain,
  chains,
  signerProvider,
  address,
  disconnect,
}: {
  children: ReactNode;
  currentChain: Chain & {
    id: number;
    unsupported?: boolean | undefined;
  };
  chains: Chain[];
  signerProvider: Provider;
  address: string;
  disconnect: () => void;
}) => {
  // Rari and Fuse get initially set already
  const fuse = useMemo(() => {
    return initFuseWithProviders(signerProvider as Web3Provider, currentChain.id);
  }, [signerProvider, currentChain.id]);
  const scanUrl = getScanUrlByChainId(currentChain.id);
  const [viewMode, setViewMode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingTxHashes, setPendingTxHashes] = useState<string[]>([]);
  const [pendingTxHash, setPendingTxHash] = useState<string>('');
  const [finishedTxHash, setFinishedTxHash] = useState<string>('');
  const addressIcons = useMemo(() => {
    const result: { [key: string]: string } = {};
    fuse.supportedAssets.map((asset) => {
      result[asset.underlying.toLowerCase()] = asset.symbol;
    });
    return result;
  }, [fuse.supportedAssets]);

  const accountBtnElement = useRef<HTMLButtonElement>();
  const networkBtnElement = useRef<HTMLButtonElement>();

  const toast = useToast();
  const queryClient = useQueryClient();

  const { cPage } = useColors();

  const mounted = useRef(false);

  const coingeckoId = WRAPPED_NATIVE_TOKEN_DATA[currentChain.id].coingeckoId;

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
        const tx = await fuse.provider.getTransaction(hash);
        if (tx.from === address) {
          toast({
            title: <>Pending!</>,
            description: <>Transaction is pending now.</>,
            status: 'info',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          });
          const res = await tx.wait();
          toast({
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
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
          if (res.blockNumber) {
            mounted.current && setFinishedTxHash(hash);
            await queryClient.refetchQueries();
          }
        }
      } catch (e) {
        handleGenericError(e, toast);
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
  }, [pendingTxHash, fuse, address]);

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
      fuse,
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
      addressIcons,
    };
  }, [
    fuse,
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
    addressIcons,
  ]);

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

// Hook
export function useRari() {
  const context = useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}
