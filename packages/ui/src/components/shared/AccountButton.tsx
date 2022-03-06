import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardBox from '@components/shared/DashboardBox';
import Jazzicon from '@components/shared/Jazzicon';
import { ModalDivider, ModalTitleWithCloseButton } from '@components/shared/Modal';
import SwitchNetworkButton from '@components/shared/SwitchNetworkButton';
import { LanguageSelect } from '@components/shared/TranslateButton';
import { useRari } from '@context/RariContext';
import { useAuthedCallback } from '@hooks/useAuthedCallback';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { Center, Column, Row } from '@utils/chakraUtils';
import { shortAddress } from '@utils/shortAddress';

export const AccountButton = memo(() => {
  const {
    isOpen: isSettingsModalOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure();

  const authedOpenSettingsModal = useAuthedCallback(openSettingsModal);
  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <Buttons openModal={authedOpenSettingsModal} />
    </>
  );
});

const Buttons = ({ openModal }: { openModal: () => void }) => {
  const { address, isAuthed, login, isAttemptingLogin } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  const handleAccountButtonClick = useCallback(() => {
    if (isAuthed) {
      openModal();
    } else login();
  }, [isAuthed, login, openModal]);
  const { subBgColor, subTextColor } = useColors();
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <SwitchNetworkButton />
      <DashboardBox
        ml={isMobile ? 2 : 4}
        as="button"
        height="40px"
        flexShrink={0}
        flexGrow={0}
        background={subBgColor}
        color={subTextColor}
        width="133px"
        onClick={handleAccountButtonClick}
      >
        <Row expand mainAxisAlignment="space-around" crossAxisAlignment="center" px={3} py={1}>
          {/* Conditionally display Connect button or Account button */}
          {!isAuthed ? (
            isAttemptingLogin ? (
              <Spinner />
            ) : (
              <Text fontWeight="semibold">{t('Connect')}</Text>
            )
          ) : (
            <Center>
              <Stack border="transparent" w="100%" h="100%" direction="row" spacing={8}>
                <Jazzicon diameter={23} address={address} style={{ display: 'contents' }} />
              </Stack>
              <Text ml={2} mt={1} fontWeight="semibold">
                {shortAddress(address)}
              </Text>
            </Center>
          )}
        </Row>
      </DashboardBox>
    </Row>
  );
};

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  const { login, logout } = useRari();
  const { bgColor, textColor, borderColor, solidBtnActiveBgColor, solidSecondBtnBgColor } =
    useColors();
  const modalStyle = {
    backgroundColor: bgColor,
    width: { md: '450px', base: '92%' },
    color: textColor,
    borderRadius: '10px',
    border: `4px solid ${borderColor}`,
  };
  const onSwitchWallet = () => {
    onClose();
    setTimeout(() => login(false), 100);
  };

  const handleDisconnectClick = () => {
    onClose();
    logout();
  };

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <ModalTitleWithCloseButton text={t('Account')} onClose={onClose} />

        <ModalDivider />

        <Column width="100%" mainAxisAlignment="flex-start" crossAxisAlignment="center" p={4}>
          <Button
            bg={solidBtnActiveBgColor}
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={onSwitchWallet}
            _hover={{}}
            _active={{}}
            mb={4}
          >
            {t('Switch Wallet')}
          </Button>

          <Button
            bg={solidSecondBtnBgColor}
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

          <LanguageSelect />

          <Row
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            mt={4}
            width="100%"
            color={textColor}
          >
            <Link target="_blank" href="https://docs.rari.capital/">
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Docs')}
              </Text>
            </Link>
            <Link
              target="_blank"
              href="https://www.notion.so/Rari-Capital-3d762a07d2c9417e9cd8c2e4f719e4c3"
            >
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Notion')}
              </Text>
            </Link>
            <Link
              target="_blank"
              href="https://www.notion.so/Rari-Capital-Audit-Quantstamp-December-2020-24a1d1df94894d6881ee190686f47bc7"
            >
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Audit')}
              </Text>
            </Link>
          </Row>

          <Text mt={4} fontSize="10px" color={textColor}>
            {t('Version')}
          </Text>
        </Column>
      </ModalContent>
    </Modal>
  );
};
