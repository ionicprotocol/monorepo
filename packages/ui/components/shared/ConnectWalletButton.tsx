import { Button, useDisclosure } from '@chakra-ui/react';
import React from 'react';

import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';

const ConnectWalletButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button id="connectWalletBtn" variant="_solid" onClick={onOpen} px={2}>
        Connect Wallet
      </Button>
      <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default ConnectWalletButton;
