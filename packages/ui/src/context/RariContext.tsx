// Next
import { useColorMode, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { Fuse, SupportedChains } from '@midas-capital/sdk';
import LogRocket from 'logrocket';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
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
import { useQueryClient } from 'react-query';

import {
  createAddEthereumChainParams,
  getChainMetadata,
  getScanUrlByChainId,
  getSupportedChains,
  isSupportedChainId,
} from '@constants/networkData';
import { useColors } from '@hooks/useColors';
import { initFuseWithProviders, providerURLForChain } from '@utils/web3Providers';

async function launchModalLazy(
  t: (text: string, extra?: any) => string,
  cacheProvider = true,
  colors: { [key: string]: string }
) {
  const [WalletConnectProvider, Authereum, Fortmatic, Web3Modal] = await Promise.all([
    import('@walletconnect/web3-provider'),
    import('authereum'),
    import('fortmatic'),
    import('web3modal'),
  ]);

  const { bgColor, textColor, borderColor, rowHoverBgColor } = colors;

  const providerOptions = {
    injected: {
      display: {
        description: t('Connect with a browser extension'),
      },
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        rpc: {
          [SupportedChains.chapel]: providerURLForChain(SupportedChains.chapel),
        },
      },
      display: {
        description: t('Scan with a wallet to connect'),
      },
    },
    fortmatic: {
      package: Fortmatic.default,
      options: {
        key: process.env.REACT_APP_FORTMATIC_KEY,
      },
      display: {
        description: t('Connect with your {{provider}} account', {
          provider: 'Fortmatic',
        }),
      },
    },
    authereum: {
      package: Authereum.default,
      display: {
        description: t('Connect with your {{provider}} account', {
          provider: 'Authereum',
        }),
      },
    },
  };

  if (!cacheProvider) {
    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
  }

  const web3Modal = new Web3Modal.default({
    cacheProvider,
    providerOptions,
    theme: {
      background: bgColor,
      main: textColor,
      secondary: textColor,
      border: borderColor,
      hover: rowHoverBgColor,
    },
  });

  return web3Modal.connect();
}

export interface RariContextData {
  fuse: Fuse;
  web3ModalProvider: any | null;
  isAuthed: boolean;
  login: (cacheProvider?: boolean) => Promise<any>;
  logout: () => any;
  address: string;
  isAttemptingLogin: boolean;
  chainId: number | undefined;
  switchNetwork: (newChainId: number) => void;
  scanUrl: string | null;
  viewMode: string;
  setViewMode: Dispatch<string>;
  loading: boolean;
  setLoading: Dispatch<boolean>;
}

export const EmptyAddress = '0x0000000000000000000000000000000000000000';

export const RariContext = createContext<RariContextData | undefined>(undefined);

export const RariProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  // Rari and Fuse get initally set already
  const [fuse, setFuse] = useState<Fuse>(() => initFuseWithProviders());

  const [isAttemptingLogin, setIsAttemptingLogin] = useState<boolean>(false);

  const [address, setAddress] = useState<string>(EmptyAddress);

  const [web3ModalProvider, setWeb3ModalProvider] = useState<any | null>(null);

  const [chainId, setChainId] = useState<number | undefined>();

  const [scanUrl, setScanUrl] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const colors = useColors();

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    mounted.current &&
      Promise.all([fuse.provider.send('net_version', []), fuse.provider.getNetwork()]).then(
        ([, network]) => {
          const { chainId } = network;

          mounted.current && setChainId(chainId);
          mounted.current && setScanUrl(getScanUrlByChainId(chainId));

          if (!isSupportedChainId(chainId) && !toast.isActive('unsupported-network')) {
            toast({
              id: 'unsupported-network',
              title: 'Unsupported Network!',
              description: `Supported Networks: ${getSupportedChains()
                .map((chain) => chain.shortName)
                .join(', ')}`,
              status: 'warning',
              position: 'bottom-right',
              duration: null,
              isClosable: true,
            });
          } else if (isSupportedChainId(chainId) && toast.isActive('unsupported-network')) {
            toast.close('unsupported-network');
          }
        }
      );
  }, [fuse, toast]);

  // We need to give rari the new provider (todo: and also ethers.js signer) every time someone logs in again
  const setRariAndAddressFromModal = useCallback(
    async (modalProvider) => {
      const provider = new Web3Provider(modalProvider);
      const { chainId } = await provider.getNetwork();

      const fuseInstance = initFuseWithProviders(provider, chainId);

      mounted.current && setFuse(fuseInstance);

      fuseInstance.provider.listAccounts().then((addresses: string[]) => {
        if (addresses.length === 0) {
          router.reload();
        }

        const address = addresses[0];
        const requestedAddress = router.query.address as string;

        LogRocket.identify(address);
        mounted.current && setAddress(requestedAddress ?? address);
      });
    },
    [setAddress, router]
  );

  const login = useCallback(
    async (cacheProvider = true) => {
      try {
        mounted.current && setIsAttemptingLogin(true);
        const providerWeb3Modal = await launchModalLazy(t, cacheProvider, colors);
        mounted.current && setWeb3ModalProvider(providerWeb3Modal);
        mounted.current && setRariAndAddressFromModal(providerWeb3Modal);
        mounted.current && setIsAttemptingLogin(false);
      } catch (err) {
        mounted.current && setIsAttemptingLogin(false);
        return console.error(err);
      }
    },
    [setWeb3ModalProvider, setRariAndAddressFromModal, setIsAttemptingLogin, t, colors]
  );

  const refetchAccountData = useCallback(() => {
    mounted.current && web3ModalProvider !== null && setRariAndAddressFromModal(web3ModalProvider);

    queryClient.clear();
  }, [setRariAndAddressFromModal, web3ModalProvider, queryClient]);

  const logout = useCallback(() => {
    mounted.current &&
      setWeb3ModalProvider((past: any) => {
        if (past?.off) {
          past.off('accountsChanged', refetchAccountData);
          past.off('chainChanged', refetchAccountData);
        }

        return null;
      });

    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');

    mounted.current && setAddress(EmptyAddress);
  }, [setWeb3ModalProvider, refetchAccountData]);

  useEffect(() => {
    if (web3ModalProvider !== null && web3ModalProvider.on) {
      web3ModalProvider.on('accountsChanged', refetchAccountData);
      web3ModalProvider.on('chainChanged', refetchAccountData);
    }

    return () => {
      if (web3ModalProvider?.off) {
        web3ModalProvider.off('accountsChanged', refetchAccountData);
        web3ModalProvider.off('chainChanged', refetchAccountData);
      }
    };
  }, [web3ModalProvider, refetchAccountData]);

  // Based on Metamask-recommended code at
  // https://docs.metamask.io/guide/rpc-api.html#usage-with-wallet-switchethereumchain
  // TODO(nathanhleung) handle all possible errors

  const value = useMemo(() => {
    const switchNetwork = async function (chainId: SupportedChains) {
      const hexChainId = chainId.toString(16);
      const chainMetadata = getChainMetadata(chainId);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${hexChainId}` }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as any).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: chainMetadata ? createAddEthereumChainParams(chainMetadata) : undefined,
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      } finally {
        refetchAccountData();
      }
    };

    return {
      web3ModalProvider,
      fuse,
      isAuthed: address !== EmptyAddress,
      login,
      logout,
      address,
      isAttemptingLogin,
      chainId,
      switchNetwork,
      scanUrl,
      viewMode,
      setViewMode,
      loading,
      setLoading,
    };
  }, [
    web3ModalProvider,
    login,
    logout,
    address,
    fuse,
    isAttemptingLogin,
    chainId,
    refetchAccountData,
    scanUrl,
    viewMode,
    setViewMode,
    loading,
    setLoading,
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
