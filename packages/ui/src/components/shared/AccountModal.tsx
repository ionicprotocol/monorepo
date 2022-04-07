import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { TransactionResponse } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConnectWalletModal from '@components/shared/ConnectWalletModal';
import { ModalDivider, ModalTitleWithCloseButton } from '@components/shared/Modal';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { Column, Row } from '@utils/chakraUtils';
import { shortAddress } from '@utils/shortAddress';

const AccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  const { pendingTxHashes, fuse, scanUrl, disconnect } = useRari();
  const { cSolidBtn, cCard } = useColors();
  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    borderRadius: '10px',
    border: `2px solid ${cCard.borderColor}`,
  };
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
      const info = await Promise.all(
        pendingTxHashes.map(async (hash) => {
          return await fuse.provider.getTransaction(hash);
        })
      );
      setTxInfo(info);
    };

    if (pendingTxHashes.length) {
      func();
    }
  }, [pendingTxHashes, fuse]);

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
        <ModalContent {...modalStyle}>
          <ModalTitleWithCloseButton text={t('Account')} onClose={onClose} />

          <ModalDivider />

          <Column width="100%" mainAxisAlignment="flex-start" crossAxisAlignment="center" p={4}>
            <Button
              bg={cSolidBtn.primary.bgColor}
              color={cSolidBtn.primary.txtColor}
              width="100%"
              height="45px"
              fontSize="xl"
              borderRadius="7px"
              fontWeight="bold"
              onClick={onSwitchWallet}
              _hover={{ bg: cSolidBtn.primary.hoverBgColor }}
              _active={{}}
              mb={4}
            >
              {t('Switch Wallet')}
            </Button>

            <Button
              bg={cSolidBtn.secondary.bgColor}
              color={cSolidBtn.secondary.txtColor}
              width="100%"
              height="45px"
              fontSize="xl"
              borderRadius="7px"
              fontWeight="bold"
              onClick={handleDisconnectClick}
              _hover={{}}
              _active={{}}
              mb={4}
            >
              {t('Disconnect')}
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
                  {t('Your transactions will appear here')}
                </Text>
              ) : (
                <>
                  <Text fontSize={20} mb={4}>
                    {t('Pending transactions')}
                  </Text>
                  {pendingTxHashes.map((hash, index) => (
                    <Button
                      key={index}
                      href={`${scanUrl}/tx/${hash}`}
                      rightIcon={<ExternalLinkIcon />}
                      color={cCard.txtColor}
                      variant={'link'}
                      as={Link}
                      isExternal
                      width="100%"
                    >
                      {shortAddress(hash, 12, 10)}
                    </Button>
                  ))}
                </>
              )}
            </Column>
            <Row
              mainAxisAlignment="center"
              crossAxisAlignment="center"
              mt={4}
              width="100%"
              color={cCard.txtColor}
            >
              <Link target="_blank" href="https://docs.midas.capital/">
                <Text mx={2} size="sm" textDecoration="underline">
                  {t('Docs')}
                </Text>
              </Link>
              <Link target="_blank" href="https://www.notion.so/Midas-Capital">
                <Text mx={2} size="sm" textDecoration="underline">
                  {t('Notion')}
                </Text>
              </Link>
              <Link target="_blank" href="https://www.notion.so/Midas-Capital-Audit">
                <Text mx={2} size="sm" textDecoration="underline">
                  {t('Audit')}
                </Text>
              </Link>
            </Row>

            <Text mt={4} fontSize="10px" color={cCard.txtColor}>
              {t('Version')}
            </Text>
          </Column>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountModal;
