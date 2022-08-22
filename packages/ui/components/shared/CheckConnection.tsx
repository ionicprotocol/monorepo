import { Text, ToastId, useDisclosure } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Chain, useAccount, useDisconnect, useNetwork, useSigner, useSwitchNetwork } from 'wagmi';

import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import { MidasProvider } from '@ui/context/MidasContext';
import { useWarningToast } from '@ui/hooks/useToast';
import { isSupportedChainId } from '@ui/utils/networkData';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const { chain, chains } = useNetwork();
  const { isLoading: isNetworkLoading, isIdle, switchNetworkAsync } = useSwitchNetwork();
  const { data: signerData } = useSigner();
  const { address, isConnecting, isReconnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const routerChainId = router.query.chainId as string;

  const toastIdRef = useRef<ToastId | undefined>();
  const warningToast = useWarningToast();
  const [switchedChain, setSwitchedChain] = useState<Chain | undefined>();

  const [signerChainId, setSignerChainId] = useState<number | undefined>();
  useEffect(() => {
    const func = async () => {
      if (typeof signerData?.getChainId === 'function') {
        const _signerChainId = await signerData?.getChainId();
        setSignerChainId(_signerChainId);
      }
    };

    func();
  }, [signerData]);

  useEffect(() => {
    if ((!isConnecting && !isReconnecting && !isConnected) || chain?.unsupported) {
      onOpen();
    }
  }, [isConnected, onOpen, isConnecting, isReconnecting, chain?.unsupported]);

  useEffect(() => {
    const func = async () => {
      // if network isn't being changed and router is ready
      if (!isNetworkLoading && router.isReady) {
        // if active chain exists
        if (chain?.id) {
          // if selected chain is unsupported
          if (chain.unsupported) {
            // if warning notification should show for letting user change to support network
            if (!toastIdRef.current) {
              toastIdRef.current = warningToast({
                title: `Unsupported Network(${chain.name}) Detected!`,
                description: (
                  <>
                    <Text>{`Supported Networks: ${chains
                      .map((chain) => chain.name)
                      .join(', ')}`}</Text>
                  </>
                ),
                duration: null,
              });
            }
          }
          // if selected chain is supported one
          else {
            // if warning notification is still displayed, then remove it
            if (toastIdRef.current) {
              warningToast.close(toastIdRef.current);
              toastIdRef.current = undefined;
            }
            // if URL contains routerChainId
            if (routerChainId) {
              // if inputed URL contains one of supported chains
              if (isSupportedChainId(Number(routerChainId))) {
                // if active chain id is different from router chain id
                if (chain.id.toString() !== routerChainId) {
                  // if user didn't change network from the metamask, then it will require changing network from metamask
                  if (isIdle && switchNetworkAsync) {
                    const chain = await switchNetworkAsync(Number(routerChainId));
                    setSwitchedChain(chain);
                  }
                  // if user changed network from the network, then routerChainId will be changed
                  if (!isIdle && !switchedChain) {
                    router.isReady &&
                      router
                        .push(
                          {
                            pathname: `/[chainId]`,
                            query: { chainId: chain.id.toString(), sortBy: 'supply' },
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
                router.isReady &&
                  router.push(
                    {
                      pathname: `/[chainId]`,
                      query: { chainId: chain.id.toString(), sortBy: 'supply' },
                    },
                    undefined,
                    { shallow: true }
                  );
                warningToast({
                  title: `Wrong Chain ID`,
                  description: (
                    <>
                      <Text>Detected unsupported chain ID in the URL</Text>
                    </>
                  ),
                });
              }
            } else {
              router.isReady &&
                router.push(
                  {
                    pathname: `/[chainId]`,
                    query: { chainId: chain.id.toString(), sortBy: 'supply' },
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
    chain,
    routerChainId,
    router,
    switchNetworkAsync,
    isNetworkLoading,
    isIdle,
    warningToast,
    chains,
    switchedChain,
  ]);

  if (isConnecting || isReconnecting || isNetworkLoading || signerChainId !== chain?.id) {
    return <LoadingOverlay isLoading={true} />;
  }
  // Not Connected
  else if (!isConnected && !isConnecting && !isReconnecting) {
    return <ConnectWalletModal isOpen={isOpen} onClose={onClose} />;
  } // Wrong Network
  else if (!chain || chain.unsupported) {
    return <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />;
  }

  // Everything Fine
  else if (chain && address && signerData?.provider && signerChainId === chain.id) {
    return (
      <MidasProvider
        currentChain={chain}
        chains={chains}
        signerProvider={signerData.provider}
        address={address}
        disconnect={disconnect}
      >
        {children}
      </MidasProvider>
    );
    // !accountData?.address || !signerData?.provider
  } else {
    return null;
  }
};

export default CheckConnection;
