import { Button, Center, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import AccountModal from '@ui/components/shared/AccountModal';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { shortAddress } from '@ui/utils/shortAddress';

export const AccountButton = ({ address }: { address: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { pendingTxHashes } = useMultiMidas();

  return (
    <Button id="walletBtn" variant="_solid" onClick={onOpen} ml={2} px={2}>
      <Center>
        {pendingTxHashes.length === 0 ? (
          <HStack>
            {<Jazzicon diameter={23} seed={jsNumberForAddress(address)} />}
            {!isMobile && <Text>{shortAddress(address)}</Text>}
          </HStack>
        ) : (
          <>
            <Text mr={2}>{pendingTxHashes.length} Pending</Text>
            <Spinner w={5} h={5} />
          </>
        )}
      </Center>
      <AccountModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};
