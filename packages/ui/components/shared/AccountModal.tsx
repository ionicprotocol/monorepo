import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Divider,
  Flex,
  Link,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { TransactionResponse } from '@ethersproject/providers';
import { useEffect, useMemo, useState } from 'react';

import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import { Column } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { getScanUrlByChainId } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

const AccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { pendingTxHashes, currentSdk, currentChain, disconnect, address } = useMultiMidas();
  const scanUrl = useMemo(() => {
    if (currentChain) return getScanUrlByChainId(currentChain.id);
  }, [currentChain]);
  const { cCard } = useColors();
  const {
    isOpen: isConnectWalletModalOpen,
    onOpen,
    onClose: onConnectWalletModalClose,
  } = useDisclosure();

  const onSwitchWallet = () => {
    onClose();
    onOpen();
  };

  const handleDisconnectClick = () => {
    onClose();
    disconnect();
  };

  const [, setTxInfo] = useState<Array<TransactionResponse>>();

  useEffect(() => {
    const func = async () => {
      if (currentSdk) {
        const info = await Promise.all(
          pendingTxHashes.map(async (hash) => {
            return await currentSdk.provider.getTransaction(hash);
          })
        );
        setTxInfo(info);
      }
    };

    if (pendingTxHashes.length > 0 && currentSdk) {
      func();
    }
  }, [pendingTxHashes, currentSdk]);

  return (
    <>
      <ConnectWalletModal isOpen={isConnectWalletModalOpen} onClose={onConnectWalletModalClose} />
      <Modal
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex display="flex" alignItems="baseline">
              <Text variant="title">Account</Text>
              <Text variant="mdText" ml={2}>
                {`( ${address && shortAddress(address, 6, 4)} )`}
              </Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={4} />
          <Divider />
          <Column width="100%" mainAxisAlignment="flex-start" crossAxisAlignment="center" p={4}>
            <Button width="100%" onClick={onSwitchWallet} mb={4}>
              Switch Wallet
            </Button>
            <Button width="100%" variant="silver" onClick={handleDisconnectClick} mb={4}>
              Disconnect
            </Button>
            <Column
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              mt={4}
              width="100%"
              color={cCard.txtColor}
            >
              {!pendingTxHashes.length ? (
                <Text fontSize={20} mb={4}>
                  Your transactions will appear here
                </Text>
              ) : (
                <>
                  <Text fontSize={20} mb={4}>
                    Pending transactions
                  </Text>
                  <VStack alignContent={'flex-start'}>
                    {pendingTxHashes.map((hash, index) => (
                      <Button
                        key={index}
                        href={`${scanUrl}/tx/${hash}`}
                        rightIcon={<ExternalLinkIcon />}
                        variant={'link'}
                        as={Link}
                        isExternal
                        width="100%"
                      >
                        {shortAddress(hash, 6, 4)}
                      </Button>
                    ))}
                  </VStack>
                </>
              )}
            </Column>
          </Column>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountModal;
