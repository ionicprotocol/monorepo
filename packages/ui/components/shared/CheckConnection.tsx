import { Text, ToastId, useDisclosure, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Chain, useAccount, useConnect, useDisconnect, useNetwork, useSigner } from 'wagmi';

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
    isIdle,
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
  const [switchedChain, setSwitchedChain] = useState<Chain | undefined>();

  const [signerChainId, setSignerChainId] = useState<number | undefined>();
  useEffect(() => {
    const func = async () => {
      const _signerChainId = await signerData?.getChainId();
      setSignerChainId(_signerChainId);
    };

    func();
  }, [signerData]);

  useEffect(() => {
    if ((!isConnecting && !isReconnecting && !isConnected) || activeChain?.unsupported) {
      onOpen();
    }
  }, [isConnected, onOpen, isConnecting, isReconnecting, activeChain?.unsupported]);

  useEffect(() => {
    const func = async () => {
      // if network isn't being changed and router is ready
      if (!isNetworkLoading && router.isReady) {
        // if active chain exists
        if (activeChain?.id) {
          // if selected chain is unsupported
          if (activeChain.unsupported) {
            // if warning notification should show for letting user change to support network
            if (!toastIdRef.current) {
              toastIdRef.current = toast({
                title: `Unsupported Network(${activeChain.name}) Detected!`,
                description: (
                  <>
                    <Text>{`Supported Networks: ${chains
                      .map((chain) => chain.name)
                      .join(', ')}`}</Text>
                  </>
                ),
                status: 'warning',
                position: 'bottom-right',
                duration: null,
                isClosable: true,
              });
            }
          }
          // if selected chain is supported one
          else {
            // if warning notification is still displayed, then remove it
            if (toastIdRef.current) {
              toast.close(toastIdRef.current);
              toastIdRef.current = undefined;
            }
            // if URL contains routerChainId
            if (routerChainId) {
              // if inputed URL contains one of supported chains
              if (isSupportedChainId(Number(routerChainId))) {
                // if active chain id is different from router chain id
                if (activeChain.id.toString() !== routerChainId) {
                  // if user didn't change network from the metamask, then it will require changing network from metamask
                  if (isIdle && switchNetworkAsync) {
                    const chain = await switchNetworkAsync(Number(routerChainId));
                    setSwitchedChain(chain);
                  }
                  // if user changed network from the network, then routerChainId will be changed
                  if (!isIdle && !switchedChain) {
                    router
                      .push(
                        {
                          pathname: `/[chainId]`,
                          query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
                        },
                        undefined,
                        { shallow: true }
                      )
                      .then(() => {
                        setSwitchedChain(undefined);
                      });
                  }
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
            } else {
              router.push(
                {
                  pathname: `/[chainId]`,
                  query: { chainId: activeChain.id.toString(), sortBy: 'supply' },
                },
                undefined,
                { shallow: true }
              );
            }
          }
        } else {
          router.push('/', undefined, { shallow: true });
        }
      }
    };

    func();
  }, [
    activeChain,
    routerChainId,
    router,
    switchNetworkAsync,
    isNetworkLoading,
    isIdle,
    toast,
    chains,
    switchedChain,
  ]);

  if (isConnecting || isReconnecting || isNetworkLoading || signerChainId !== activeChain?.id) {
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
  else if (
    activeChain &&
    accountData?.address &&
    signerData?.provider &&
    signerChainId === activeChain.id
  ) {
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
