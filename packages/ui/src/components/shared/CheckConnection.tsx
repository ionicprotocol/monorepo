import { Text, ToastId, useDisclosure, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSigner } from 'wagmi';

import { isSupportedChainId } from '../../networkData';

import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import LoadingOverlay from '@ui/components/shared/LoadingOverlay';
import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import { RariProvider } from '@ui/context/RariContext';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const { activeChain, chains, switchNetwork } = useNetwork();
  const { data: signerData } = useSigner();
  const { isConnecting, isReconnecting, isConnected } = useConnect();
  const { data: accountData } = useAccount();
  const { disconnect } = useDisconnect();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const routerChainId = router.query.chainId as string;

  const toastIdRef = useRef<ToastId | undefined>();
  const toast = useToast();

  // useEffect(() => {
  //   if ((!isConnecting && !isReconnecting && !isConnected) || activeChain?.unsupported) {
  //     onOpen();
  //   }
  // }, [isConnected, onOpen, isConnecting, isReconnecting, activeChain?.unsupported]);

  // // Show unsupported Network Toast
  // useEffect(() => {
  //   if (activeChain?.unsupported) {
  //     if (!toastIdRef.current) {
  //       toastIdRef.current = toast({
  //         title: `Unsupported Network(${activeChain.name}) Detected!`,
  //         description: (
  //           <>
  //             <Text>{`Supported Networks: ${chains.map((chain) => chain.name).join(', ')}`}</Text>
  //           </>
  //         ),
  //         status: 'warning',
  //         position: 'bottom-right',
  //         duration: null,
  //         isClosable: true,
  //       });
  //     }
  //   } else {
  //     if (toastIdRef.current) {
  //       toast.close(toastIdRef.current);
  //       toastIdRef.current = undefined;
  //     }
  //   }
  // }, [activeChain, chains, toast]);

  // // User visits a link of another chain than currently connected
  // useEffect(() => {
  //   if (
  //     router.isReady &&
  //     activeChain &&
  //     routerChainId !== activeChain.id.toString() &&
  //     switchNetwork
  //   ) {
  //     if (isSupportedChainId(Number(routerChainId))) {
  //       switchNetwork(Number(routerChainId));
  //     }
  //   }
  // }, [routerChainId, switchNetwork, router, activeChain]);

  // // User should get redirected to chain he is connected to
  // useEffect(() => {
  //   if (activeChain?.id && !routerChainId && router.isReady && !activeChain.unsupported) {
  //     const chainId = activeChain.id.toString();
  //     router.push(
  //       {
  //         pathname: `/[chainId]`,
  //         query: { chainId, sortBy: 'supply' },
  //       },
  //       undefined,
  //       { shallow: true }
  //     );
  //   }
  // }, [activeChain?.id, activeChain?.unsupported, router, routerChainId]);

  // Not Connected
  if (!isConnected && !isReconnecting) {
    return <ConnectWalletModal isOpen={isOpen} onClose={onClose} />;
  }

  // Wrong Network
  if (!activeChain || activeChain.unsupported) {
    return <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />;
  }

  // Everything Fine
  if (activeChain && accountData?.address && signerData?.provider) {
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
  }

  // Loading
  return <LoadingOverlay isLoading={true} />;
};

export default CheckConnection;
