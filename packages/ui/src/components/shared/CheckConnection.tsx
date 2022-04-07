import { Text, ToastId, useDisclosure, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef } from 'react';
import { useAccount, useConnect, useNetwork, useSigner } from 'wagmi';

import LoadingOverlay from './LoadingOverlay';

import ConnectWalletModal from '@components/shared/ConnectWalletModal';
import SwitchNetworkModal from '@components/shared/SwitchNetworkModal';
import { RariProvider } from '@context/RariContext';

const CheckConnection = ({ children }: { children: ReactNode }) => {
  const [
    {
      data: { chain: currentChain, chains },
      loading: networkloading,
    },
  ] = useNetwork();
  const [{ data: signerData }] = useSigner();
  const [
    {
      data: { connected },
      loading: connectLoading,
    },
  ] = useConnect();
  const [{ data: accountData, loading: accountLoading }, disconnect] = useAccount({
    fetchEns: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const routerChainId = router.query.chainId as string;
  const isReady = router.isReady;
  const toastIdRef = useRef<ToastId | undefined>();
  const toast = useToast();

  useEffect(() => {
    if ((!connectLoading && !connected) || currentChain?.unsupported) {
      onOpen();
    }
  }, [connected, onOpen, connectLoading, currentChain?.unsupported]);

  useEffect(() => {
    if (currentChain?.unsupported) {
      if (!toastIdRef.current) {
        toastIdRef.current = toast({
          title: `Unsupported Network(${currentChain.name}) Detected!`,
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
  }, [currentChain, chains, toast]);

  useEffect(() => {
    if (isReady && currentChain?.id && routerChainId !== currentChain.id.toString()) {
      const chainId = currentChain.id.toString();

      router.push(
        {
          pathname: `/[chainId]`,
          query: { chainId, sortBy: 'supply' },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [currentChain?.id, isReady, routerChainId]);

  useEffect(() => {
    if (!connectLoading && !connected) {
      router.push('/', undefined, { shallow: true });
    }
  }, [connected, connectLoading]);

  return (
    <>
      <Head>
        <title>Midas Capital</title>
      </Head>
      {connectLoading ? (
        <LoadingOverlay isLoading={true} />
      ) : !connected ? (
        <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
      ) : networkloading ? (
        <LoadingOverlay isLoading={true} />
      ) : !currentChain || currentChain.unsupported ? (
        <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
      ) : !signerData?.provider ? (
        <LoadingOverlay isLoading={true} />
      ) : accountLoading || !accountData ? (
        <LoadingOverlay isLoading={true} />
      ) : (
        <RariProvider
          currentChain={currentChain}
          chains={chains}
          signerProvider={signerData.provider}
          address={accountData.address}
          disconnect={disconnect}
        >
          {children}
        </RariProvider>
      )}
    </>
  );
};

export default CheckConnection;
