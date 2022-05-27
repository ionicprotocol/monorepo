import { Text, ToastId, useDisclosure, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSigner } from 'wagmi';

import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import { RariProvider } from '@ui/context/RariContext';
import { isSupportedChainId } from '@ui/networkData/index';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const {
    activeChain,
    chains,
    switchNetworkAsync,
    isLoading: isNetworkLoading,
    isError,
  } = useNetwork();
  const { data: signerData } = useSigner();
  const { isConnecting, isReconnecting, isConnected } = useConnect();
  const { data: accountData } = useAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const routerChainId = router.query.chainId as string;

  const toastIdRef = useRef<ToastId | undefined>();
  const toast = useToast();

  useEffect(() => {
    if ((!isConnecting && !isReconnecting && !isConnected) || activeChain?.unsupported) {
      onOpen();
    }
  }, [isConnected, onOpen, isConnecting, isReconnecting, activeChain?.unsupported]);

  //user gets error when user is switching network in the UI, then user will be back to the network before.
  useEffect(() => {
    if (isError) {
      if (activeChain?.id) {
        router.push(
          {
            pathname: `/[chainId]`,
            query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
          },
          undefined,
          { shallow: true }
        );
      } else {
        router.push('/', undefined, { shallow: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  // Show unsupported Network Toast
  useEffect(() => {
    if (activeChain?.unsupported) {
      if (!toastIdRef.current) {
        toastIdRef.current = toast({
          title: `Unsupported Network(${activeChain.name}) Detected!`,
          description: (
            <>
              <Text>{`Supported Networks: ${chains.map((chain) => chain.name).join(', ')}`}</Text>
            </>
          ),
          status: 'warning',
          position: 'bottom-right',
          duration: null,
          isClosable: true,
        });
      }
    } else {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
        toastIdRef.current = undefined;
      }
    }
  }, [activeChain, chains, toast]);

  // User visits a link of another chain than currently connected
  useEffect(() => {
    const func = async () => {
      if (
        router.isReady &&
        activeChain &&
        routerChainId !== activeChain.id.toString() &&
        switchNetworkAsync
      ) {
        if (isSupportedChainId(Number(routerChainId))) {
          try {
            await switchNetworkAsync(Number(routerChainId));
          } catch (e) {
            console.error(e);
          }
        } else {
          router.push(
            {
              pathname: `/[chainId]`,
              query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
            },
            undefined,
            { shallow: true }
          );
          toast({
            title: `Wrong Chain ID`,
            description: (
              <>
                <Text>Detected unsupported chain ID in the URL</Text>
              </>
            ),
            status: 'warning',
            position: 'top-right',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    func();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerChainId, switchNetworkAsync, router]);

  // When user changed network from Metamask, routerChainId should be changed
  useEffect(() => {
    if (activeChain?.id && routerChainId !== activeChain.id.toString()) {
      router.push(
        {
          pathname: `/[chainId]`,
          query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
        },
        undefined,
        { shallow: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain?.id]);

  // User should get redirected to chain he is connected to
  useEffect(() => {
    if (activeChain?.id && !routerChainId && router.isReady && !activeChain.unsupported) {
      router.push(
        {
          pathname: `/[chainId]`,
          query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [activeChain?.id, activeChain?.unsupported, router, routerChainId]);

  if (isConnecting || isReconnecting || isNetworkLoading) {
    return <LoadingOverlay isLoading={true} />;
  }
  // Not Connected
  else if (!isConnected && !isConnecting && !isReconnecting) {
    return <ConnectWalletModal isOpen={isOpen} onClose={onClose} />;
  } // Wrong Network
  else if (!activeChain || activeChain.unsupported) {
    return <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />;
  }
  // Everything Fine
  else if (activeChain && accountData?.address && signerData?.provider) {
    return (
      <RariProvider
        currentChain={activeChain}
        chains={chains}
        signerProvider={signerData.provider}
        address={accountData.address}
        disconnect={disconnect}
      >
        {children}
      </RariProvider>
    );
    // !accountData?.address || !signerData?.provider
  } else {
    return null;
  }
};

export default CheckConnection;
