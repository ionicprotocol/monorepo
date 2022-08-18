import { Button, Center, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import React, { LegacyRef } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import AccountModal from '@ui/components/shared/AccountModal';
import { useMidas } from '@ui/context/MidasContext';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { shortAddress } from '@ui/utils/shortAddress';

const ConnectWalletButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMobile = useIsSmallScreen();

  const { pendingTxHashes, accountBtnElement, address } = useMidas();

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
              <Jazzicon diameter={23} seed={jsNumberForAddress(address)} />
              {!isMobile && <Text fontWeight="semibold">{shortAddress(address)}</Text>}
            </HStack>
          </>
        ) : (
          <>
            <Text mr={2} fontWeight="semibold">
              {pendingTxHashes.length} Pending
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
