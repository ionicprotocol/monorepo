import { Button, Center, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import { useRari } from '@ui/context/RariContext';
import { useIsSmallScreen } from '@ui/hooks/useIsSmallScreen';
import { shortAddress } from '@ui/utils/shortAddress';
import React, { LegacyRef } from 'react';
import { useTranslation } from 'react-i18next';

import AccountModal from '@ui/components/shared/AccountModal';
import Jazzicon from '@ui/components/shared/Jazzicon';

const ConnectWalletButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useIsSmallScreen();

  const { t } = useTranslation();

  const { pendingTxHashes, accountBtnElement, address } = useRari();

  return (
    <Button
      variant={'topBar'}
      onClick={onOpen}
      ref={accountBtnElement as LegacyRef<HTMLButtonElement>}
    >
      <Center>
        {pendingTxHashes.length === 0 ? (
          <>
            <HStack>
              <Jazzicon diameter={23} address={address} style={{ display: 'contents' }} />
              {!isMobile && <Text fontWeight="semibold">{shortAddress(address)}</Text>}
            </HStack>
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
