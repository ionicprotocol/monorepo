import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { OpenPosition } from '@ionicprotocol/types';

import { FundPositionModal } from '@ui/components/pages/LeveragePageOld/LeverageList/OpenPosition/AdditionalInfo/FundPositionButton/FundPositionModal/index';

export const ReopenPositionButton = ({ position }: { position: OpenPosition }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Reopen Position</Button>
      <FundPositionModal isOpen={isModalOpen} onClose={closeModal} position={position} />
    </Box>
  );
};
