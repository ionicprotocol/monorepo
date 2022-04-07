import { Button, Center, Spinner, Stack, Text, useDisclosure } from '@chakra-ui/react';
import React, { LegacyRef } from 'react';
import { useTranslation } from 'react-i18next';

import AccountModal from '@components/shared/AccountModal';
import Jazzicon from '@components/shared/Jazzicon';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { shortAddress } from '@utils/shortAddress';

const ConnectWalletButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { cSolidBtn } = useColors();
  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { pendingTxHashes, accountBtnElement, address } = useRari();

  return (
    <Button
      ml={isMobile ? 2 : 4}
      height="40px"
      onClick={onOpen}
      color={cSolidBtn.primary.txtColor}
      bgColor={cSolidBtn.primary.bgColor}
      _hover={{
        background: cSolidBtn.primary.hoverBgColor,
        color: cSolidBtn.primary.hoverTxtColor,
      }}
      borderRadius={'xl'}
      px={3}
      ref={accountBtnElement as LegacyRef<HTMLButtonElement>}
    >
      <Center>
        {pendingTxHashes.length === 0 ? (
          <>
            <Stack border="transparent" w="100%" h="100%" direction="row" spacing={8}>
              <Jazzicon diameter={23} address={address} style={{ display: 'contents' }} />
            </Stack>
            <Text ml={2} mt={1} fontWeight="semibold">
              {shortAddress(address, 4, 2)}
            </Text>
          </>
        ) : (
          <>
            <Text mr={2} fontWeight="semibold">
              {pendingTxHashes.length} {t('Pending')}
            </Text>
            <Spinner w={5} h={5} />
          </>
        )}
      </Center>
      <AccountModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};

export default ConnectWalletButton;
